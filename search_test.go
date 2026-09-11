package docs

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
)

func TestBuiltAssetLicensesAndBytesMatchSeparateSnapshots(t *testing.T) {
	if script, _, _ := frontendFiles(); script == "" {
		t.Skip("run make docs-web to check built assets")
	}
	data, err := frontend.ReadFile("dist/manifest.json")
	if err != nil {
		t.Fatal(err)
	}
	var manifest map[string]frontendEntry
	if err := json.Unmarshal(data, &manifest); err != nil {
		t.Fatal(err)
	}
	handler := NewHandler()
	for source, contentType := range map[string]string{
		"web/vendor/brand/mascot-mark.svg":     "image/svg+xml",
		"web/vendor/brand/NOTICE.txt":          "text/plain; charset=utf-8",
		"web/vendor/fonts/dm-sans-latin.woff2": "font/woff2",
		"web/vendor/fonts/OFL-DM-Sans.txt":     "text/plain; charset=utf-8",
	} {
		entry, ok := manifest[source]
		if !ok {
			t.Fatalf("missing built asset or notice: %s", source)
		}
		want, err := os.ReadFile(source)
		if err != nil {
			t.Fatal(err)
		}
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, httptest.NewRequest("GET", "/docs/"+entry.File, nil))
		if w.Code != 200 || w.Header().Get("Content-Type") != contentType || !bytes.Equal(w.Body.Bytes(), want) {
			t.Fatalf("built asset must serve the original bytes and content type: %s", source)
		}
	}
	for source := range manifest {
		if strings.HasPrefix(source, "web/vendor/ui/assets/") {
			t.Fatalf("brand and font assets must not ship from the UI package: %s", source)
		}
	}
}

func TestSearchIndexContainsOnlyPublicSectionsWithWorkingAnchors(t *testing.T) {
	handler := NewHandler()
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, httptest.NewRequest("GET", "/docs/search-index.json", nil))
	if w.Code != 200 || w.Header().Get("Content-Type") != "application/json; charset=utf-8" {
		t.Fatal("missing public index")
	}
	var sections []searchSection
	if err := json.Unmarshal(w.Body.Bytes(), &sections); err != nil {
		t.Fatal(err)
	}
	if len(sections) == 0 {
		t.Fatal("empty index")
	}
	cache := map[string]string{}
	for _, section := range sections {
		route, anchor, _ := strings.Cut(section.URL, "#")
		body, ok := cache[route]
		if !ok {
			page := httptest.NewRecorder()
			handler.ServeHTTP(page, httptest.NewRequest("GET", route, nil))
			if page.Code != 200 {
				t.Fatal(route)
			}
			body = page.Body.String()
			cache[route] = body
		}
		if anchor != "" && !strings.Contains(body, `id="`+anchor+`"`) {
			t.Fatalf("missing anchor %s", section.URL)
		}
		if strings.Contains(section.Text, "verified:") || strings.Contains(section.Text, "implements:") {
			t.Fatal("private metadata indexed")
		}
	}
	head := httptest.NewRecorder()
	handler.ServeHTTP(head, httptest.NewRequest("HEAD", "/docs/search-index.json", nil))
	if head.Body.Len() != 0 || head.Header().Get("Content-Length") != w.Header().Get("Content-Length") {
		t.Fatal("index HEAD mismatch")
	}
}

func TestSearchHeadingIDsShareGoldmarkDuplicateRules(t *testing.T) {
	source := []byte("# Guide\n\nIntroduction.\n\n## Setup!\n\nUse checkout_started.\n\n## Setup!\n\nMore code.\n")
	renderer := goldmark.New(goldmark.WithParserOptions(parser.WithAutoHeadingID()))
	doc := renderer.Parser().Parse(text.NewReader(source))
	headings, sections := documentSections(doc, source, navPage{Title: "Guide", Href: "/docs/start/website"}, "Get started")
	if len(headings) != 2 || headings[0].ID != "setup" || headings[1].ID != "setup-1" {
		t.Fatalf("wrong heading IDs: %+v", headings)
	}
	if len(sections) != 3 || !strings.Contains(sections[1].Text, "checkout_started") || sections[2].URL != "/docs/start/website#setup-1" {
		t.Fatalf("wrong sections: %+v", sections)
	}
}

func TestFrontendAssetsAreBoundedAndMatchHEAD(t *testing.T) {
	script, css, logo := frontendFiles()
	if script == "" {
		t.Skip("run make docs-web to check built assets")
	}
	if logo == "" {
		t.Fatal("built documentation must include the shared logo")
	}
	paths := []string{script, logo}
	for _, name := range css {
		paths = append(paths, "/docs/"+name)
	}
	handler := NewHandler()
	for _, route := range paths {
		get := httptest.NewRecorder()
		handler.ServeHTTP(get, httptest.NewRequest("GET", route, nil))
		head := httptest.NewRecorder()
		handler.ServeHTTP(head, httptest.NewRequest("HEAD", route, nil))
		if get.Code != 200 || head.Code != 200 || head.Body.Len() != 0 || get.Body.Len() == 0 || head.Header().Get("Content-Length") != get.Header().Get("Content-Length") {
			t.Fatalf("asset GET/HEAD mismatch %s", route)
		}
		if route == logo && (get.Header().Get("Content-Type") != "image/svg+xml" || !strings.Contains(get.Body.String(), "<svg")) {
			t.Fatal("logo must be served as an SVG image")
		}
		if policy := get.Header().Get("Content-Security-Policy"); !strings.Contains(policy, "default-src 'none'") || !strings.Contains(policy, "sandbox") {
			t.Fatalf("asset %s must carry a sandboxed CSP so an SVG opened as a document is inert, got %q", route, policy)
		}
	}
	for _, route := range []string{"/docs/assets/../serve.go", "/docs/assets/a.svg", "/docs/dist/manifest.json", "/docs/assets/missing.js"} {
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, httptest.NewRequest("GET", route, nil))
		if w.Code != 404 {
			t.Fatal(route)
		}
	}
}
