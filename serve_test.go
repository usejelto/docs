package docs

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"html"
	"image/png"
	"io/fs"
	"net/http/httptest"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

// The handler casts goldmark's output to template.HTML, so the renderer must
// never be constructed with html.WithUnsafe(). The embedded guides keep every
// <script> inside a fenced block, which is why this test feeds the renderer
// hostile Markdown of its own instead of relying on the content.
func TestMarkdownRendererOmitsRawHTMLAndUnsafeLinks(t *testing.T) {
	source := []byte("# Title\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n<img src=x onerror=alert(1)>\n\n[y](data:text/html,boom)\n\n<a href=\"https://ok.example\" onclick=\"alert(1)\">z</a>\n")
	var out bytes.Buffer
	if err := newRenderer().Convert(source, &out); err != nil {
		t.Fatal(err)
	}
	body := out.String()
	if !strings.Contains(body, "<!-- raw HTML omitted -->") {
		t.Errorf("raw HTML was rendered instead of omitted:\n%s", body)
	}
	for _, forbidden := range []string{"<script", "javascript:", "onerror", "onclick", "data:text/html"} {
		if strings.Contains(body, forbidden) {
			t.Errorf("rendered Markdown still contains %q:\n%s", forbidden, body)
		}
	}
	if !strings.Contains(body, "<h1 id=\"title\">Title</h1>") {
		t.Errorf("ordinary Markdown no longer renders:\n%s", body)
	}
}

func TestEmbeddedGuidesRenderAndStayBounded(t *testing.T) {
	handler := NewHandler()
	for _, path := range []string{"/docs/", "/docs/web/configuration.md", "/docs/api/website.md", "/docs/integrations/github.md", "/docs/sdk/crawler.md", "/docs/payments/browser-attribution"} {
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 200 || !strings.Contains(w.Body.String(), "<h1") {
			t.Errorf("%s: code=%d body=%s", path, w.Code, w.Body.String())
		}
		if strings.Contains(w.Body.String(), "<script>alert") || strings.Contains(w.Body.String(), "verified:") {
			t.Errorf("%s contains executable example or frontmatter", path)
		}
		if !strings.Contains(w.Header().Get("Content-Security-Policy"), "default-src 'none'") {
			t.Error("missing docs CSP")
		}
	}
	for _, path := range []string{"/docs/../go.mod", "/docs/build-agent-twins.mjs", "/docs/absent.md"} {
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 404 {
			t.Errorf("%s: %d", path, w.Code)
		}
	}
}

func TestGuideAnchorsAndHead(t *testing.T) {
	handler := NewHandler()
	get := httptest.NewRecorder()
	handler.ServeHTTP(get, httptest.NewRequest("GET", "/docs/distribution/app-store.md", nil))
	if !strings.Contains(get.Body.String(), `id="revenue"`) {
		t.Fatal("Homebrew and winget revenue links have no heading target")
	}
	head := httptest.NewRecorder()
	handler.ServeHTTP(head, httptest.NewRequest("HEAD", "/docs/distribution/app-store.md", nil))
	if head.Code != 200 || head.Body.Len() != 0 || head.Header().Get("Content-Security-Policy") != get.Header().Get("Content-Security-Policy") {
		t.Fatal("HEAD must preserve security headers without a response body")
	}
}

func TestDocumentationImagesAndSecurity(t *testing.T) {
	handler := NewHandler()
	assets, err := fs.Glob(contentFiles, "content/images/*.png")
	if err != nil || len(assets) == 0 {
		t.Fatalf("want embedded documentation images: %v %v", assets, err)
	}
	for _, asset := range assets {
		asset = strings.TrimPrefix(asset, "content/")
		get := httptest.NewRecorder()
		handler.ServeHTTP(get, httptest.NewRequest("GET", "/docs/"+asset, nil))
		if get.Code != 200 || get.Header().Get("Content-Type") != "image/png" || get.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Fatalf("bad PNG response: %s", asset)
		}
		if _, err := png.DecodeConfig(bytes.NewReader(get.Body.Bytes())); err != nil {
			t.Fatalf("invalid PNG %s: %v", asset, err)
		}
		if get.Header().Get("Content-Length") != strconv.Itoa(get.Body.Len()) {
			t.Fatalf("incorrect asset length: %s", asset)
		}
		head := httptest.NewRecorder()
		handler.ServeHTTP(head, httptest.NewRequest("HEAD", "/docs/"+asset, nil))
		if head.Code != 200 || head.Body.Len() != 0 || head.Header().Get("Content-Length") != get.Header().Get("Content-Length") {
			t.Fatalf("invalid asset HEAD: %s", asset)
		}
	}
	for _, path := range []string{"/docs/images/missing.png", "/docs/images/../README.md", "/docs/images/subdir/test.png", "/docs/styles.css", "/docs/shell.html", "/docs/images/file.svg", "/docs/images/../../go.mod", "/docs/images/%2e%2e/README.md", "/docs/agents/../../go.mod", "/docs/navigation.json", "/docs/content/navigation.json", "/docs/content/start/quickstart.md", "/docs/operations/handbook.md"} {
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 404 {
			t.Errorf("%s: want 404, got %d", path, w.Code)
		}
	}
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, httptest.NewRequest("POST", "/docs/images/01-dashboard-overview.png", nil))
	if w.Code != 405 || w.Header().Get("Allow") != "GET, HEAD" {
		t.Fatal("asset writes must be rejected")
	}
}

func TestManifestRoutesLinksAnchorsAndAgentCopies(t *testing.T) {
	handler := NewHandler()
	cache := map[string]*httptest.ResponseRecorder{}
	get := func(path string) *httptest.ResponseRecorder {
		if result, ok := cache[path]; ok {
			return result
		}
		result := httptest.NewRecorder()
		handler.ServeHTTP(result, httptest.NewRequest("GET", path, nil))
		cache[path] = result
		return result
	}
	links := regexp.MustCompile(`(?:href|src)="([^"]+)"`)
	routes := []string{"/docs/"}
	seen := map[string]bool{}
	for _, group := range navigation("") {
		for _, page := range group.Pages {
			if seen[page.Href] {
				t.Fatalf("duplicate manifest page %s", page.Href)
			}
			seen[page.Href] = true
			routes = append(routes, page.Href, page.Href+".md")
			agent := get(strings.Replace(page.Href, "/docs/", "/docs/agents/", 1) + ".md")
			if agent.Code != 200 || agent.Header().Get("Content-Type") != "text/plain; charset=utf-8" {
				t.Fatalf("missing plain agent copy: %s", page.Href)
			}
			if !strings.HasPrefix(agent.Body.String(), "# "+page.Title+"\n") || strings.Contains(agent.Body.String(), "verified:") || strings.Contains(agent.Body.String(), "](../") {
				t.Fatalf("agent copy exposes metadata or unresolved links: %s", page.Href)
			}
		}
	}
	for _, path := range routes {
		response := get(path)
		if response.Code != 200 {
			t.Fatalf("missing manifest route %s", path)
		}
		if path != "/docs/" && !strings.Contains(response.Body.String(), `href="`+strings.TrimSuffix(path, ".md")+`" aria-current="page"`) {
			t.Fatalf("missing active page: %s", path)
		}
		base, _ := url.Parse("http://localhost" + path)
		for _, match := range links.FindAllStringSubmatch(response.Body.String(), -1) {
			ref, err := url.Parse(html.UnescapeString(match[1]))
			if err != nil {
				t.Fatal(err)
			}
			target := base.ResolveReference(ref)
			if target.Host != "localhost" || !strings.HasPrefix(target.Path, "/docs/") {
				continue
			}
			linked := get(target.Path)
			if linked.Code != 200 {
				t.Fatalf("broken link %s -> %s", path, target)
			}
			if target.Fragment != "" && !strings.Contains(linked.Body.String(), `id="`+html.EscapeString(target.Fragment)+`"`) {
				t.Fatalf("missing heading %s -> %s", path, target)
			}
		}
	}
	for _, path := range []string{"/docs/llms.txt", "/docs/agents/goals/create-goal.md"} {
		response := get(path)
		head := httptest.NewRecorder()
		handler.ServeHTTP(head, httptest.NewRequest("HEAD", path, nil))
		if response.Code != 200 || head.Code != 200 || head.Body.Len() != 0 || head.Header().Get("Content-Length") != response.Header().Get("Content-Length") {
			t.Fatalf("bad agent HEAD: %s", path)
		}
	}
	copy := get("/docs/agents/goals/create-goal.md").Body.String()
	full := canonicalDocs + "images/15-goal-registration.png"
	if !strings.Contains(copy, "]("+full+")]("+full+")") {
		t.Fatal("both linked-image destinations must be canonical")
	}
}

func TestUserGuideNavigationImagesAndCSP(t *testing.T) {
	handler := NewHandler()
	guides, err := fs.Glob(contentFiles, "content/guides/*.md")
	if err != nil || len(guides) == 0 {
		t.Fatal("expected embedded visual user guides")
	}
	imageRefs := regexp.MustCompile(`<img src="([^"]+)" alt="([^"]+)"`)
	styleBlock := regexp.MustCompile(`(?s)<style>(.*?)</style>`)
	for _, guide := range guides {
		guide = strings.TrimPrefix(guide, "content/")
		for _, path := range []string{"/docs/" + guide, "/docs/" + strings.TrimSuffix(guide, ".md")} {
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, httptest.NewRequest("GET", path, nil))
			body := w.Body.String()
			if w.Code != 200 || !strings.Contains(body, `href="/docs/`+strings.TrimSuffix(guide, ".md")+`" aria-current="page"`) {
				t.Fatalf("guide does not mark itself active: %s", path)
			}
			if !strings.Contains(body, `<details class="mobile-nav">`) {
				t.Fatal("missing native mobile disclosure")
			}
			css := styleBlock.FindStringSubmatch(body)
			if len(css) != 2 {
				t.Fatal("missing stylesheet")
			}
			hash := sha256.Sum256([]byte(css[1]))
			policy := w.Header().Get("Content-Security-Policy")
			if !strings.Contains(policy, "img-src 'self'") || !strings.Contains(policy, "default-src 'none'") || !strings.Contains(policy, "'sha256-"+base64.StdEncoding.EncodeToString(hash[:])+"'") {
				t.Fatal("CSP must permit only self images and the actual local stylesheet")
			}
			refs := imageRefs.FindAllStringSubmatch(body, -1)
			if len(refs) == 0 {
				t.Fatalf("guide has no accessible illustrations: %s", path)
			}
			base, _ := url.Parse("http://localhost" + path)
			for _, ref := range refs {
				target, _ := url.Parse(ref[1])
				resolved := base.ResolveReference(target)
				asset := httptest.NewRecorder()
				handler.ServeHTTP(asset, httptest.NewRequest("GET", resolved.String(), nil))
				if asset.Code != 200 || asset.Header().Get("Content-Type") != "image/png" {
					t.Fatalf("broken guide image: %s -> %s", path, ref[1])
				}
				if !strings.Contains(body, `href="`+ref[1]+`"><img`) {
					t.Fatal("image must link to its full-size PNG")
				}
			}
		}
	}
}
