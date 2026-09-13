// Package docs embeds the setup guides in the same binary as the dashboard.
package docs

import (
	"bytes"
	"crypto/sha256"
	"embed"
	"encoding/base64"
	"encoding/json"
	"html/template"
	"io/fs"
	"net/http"
	"strconv"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
)

//go:embed content/README.md content/*/*.md content/images/*.png
var contentFiles embed.FS

// Keep the public URL namespace independent of the on-disk content directory.
func readPage(name string) ([]byte, error) {
	return contentFiles.ReadFile("content/" + name)
}

//go:embed styles.css
var styles []byte

//go:embed footer.css
var footerStyles []byte

//go:embed shell.html
var document string

//go:embed content/navigation.json
var navigationJSON []byte

type navPage struct {
	Title, Href, Summary string
	Active               bool
}
type navGroup struct {
	ID, Title, Description string
	Pages                  []navPage
	Open                   bool
}
type manifestGroup struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Pages       []string `json:"pages"`
}

func guideTitle(source []byte) string {
	for _, line := range strings.Split(string(source), "\n") {
		if strings.HasPrefix(line, "# ") {
			return strings.TrimPrefix(line, "# ")
		}
	}
	return "Documentation"
}

func metadataValue(source []byte, key string) string {
	front := bytes.SplitN(source, []byte("\n---\n"), 2)[0]
	for _, line := range strings.Split(string(front), "\n") {
		if strings.HasPrefix(line, key+": ") {
			return strings.Trim(strings.TrimPrefix(line, key+": "), "\"'")
		}
	}
	return ""
}

func navigation(current string) []navGroup {
	var manifest []manifestGroup
	if err := json.Unmarshal(navigationJSON, &manifest); err != nil {
		panic(err)
	}
	var result []navGroup
	for _, group := range manifest {
		section := navGroup{ID: group.ID, Title: group.Title, Description: group.Description}
		section.Open = current == "README.md" && group.ID == "start"
		for _, slug := range group.Pages {
			source, err := readPage(slug + ".md")
			if err != nil {
				panic(err)
			}
			section.Pages = append(section.Pages, navPage{metadataValue(source, "title"), "/docs/" + slug, metadataValue(source, "summary"), current == slug+".md"})
			section.Open = section.Open || current == slug+".md"
		}
		result = append(result, section)
	}
	return result
}

// Only checked-in Markdown is rendered. Raw HTML and unsafe link schemes stay
// disabled in goldmark; neither templates nor filesystem paths come from users.
// newRenderer builds the one goldmark instance every guide is rendered with.
// Raw HTML and unsafe link schemes stay disabled because html.WithUnsafe() is
// never passed; that is what makes the template.HTML cast of its output safe
// inside the dashboard's origin. TestMarkdownRendererOmitsRawHTMLAndUnsafeLinks
// pins it, so adding WithUnsafe() for any reason is a red test.
func newRenderer() goldmark.Markdown {
	return goldmark.New(goldmark.WithExtensions(extension.Table), goldmark.WithParserOptions(parser.WithAutoHeadingID()))
}

// DocumentPaths lists the public address of every documentation guide, the
// index first and the rest in navigation order. Search discovery is built from
// this list so the advertised addresses always come from the same manifest that
// renders the navigation, and cannot drift from the guides that actually exist.
func DocumentPaths() []string {
	paths := []string{"/docs/"}
	for _, group := range navigation("") {
		for _, page := range group.Pages {
			paths = append(paths, page.Href)
		}
	}
	return paths
}

func NewHandler() http.Handler {
	renderer := newRenderer()
	shell := template.Must(template.New("docs").Parse(document))
	styles := bytes.Join([][]byte{styles, footerStyles}, []byte("\n"))
	hash := sha256.Sum256(styles)
	script, css, logo := frontendFiles()
	icon, iconFallback := frontendIcons()
	policy := "default-src 'none'; img-src 'self'; style-src 'sha256-" + base64.StdEncoding.EncodeToString(hash[:]) + "'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
	if script != "" {
		policy += "; script-src 'self'; style-src-elem 'self' 'sha256-" + base64.StdEncoding.EncodeToString(hash[:]) + "'; font-src 'self'; connect-src 'self'"
	}
	allowed := map[string]bool{"README.md": true}
	agentCopies := map[string][]byte{}
	groups := navigation("")
	for _, group := range groups {
		for _, page := range group.Pages {
			slug := strings.TrimPrefix(page.Href, "/docs/")
			allowed[slug+".md"] = true
			source, err := readPage(slug + ".md")
			if err != nil {
				panic(err)
			}
			agentCopies["agents/"+slug+".md"] = agentPage(source, slug, page, group)
		}
	}
	agentCopies["llms.txt"] = agentIndex(groups)
	index := searchIndex(renderer, groups)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		path := strings.TrimPrefix(r.URL.Path, "/docs/")
		if path == "" {
			path = "README.md"
		}
		if strings.HasPrefix(path, "assets/") {
			serveFrontend(w, r, path)
			return
		}
		if path == "search-index.json" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Content-Security-Policy", policy)
			w.Header().Set("Content-Length", strconv.Itoa(len(index)))
			if r.Method == http.MethodGet {
				_, _ = w.Write(index)
			}
			return
		}
		if data, ok := agentCopies[path]; ok {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			// An agent copy is a plain-text mirror of one HTML guide. Name that
			// guide as the canonical address so the mirror is not indexed in its
			// place; llms.txt mirrors no single guide and so declares nothing.
			if slug, mirrored := strings.CutPrefix(path, "agents/"); mirrored {
				w.Header().Set("Link", "<"+canonicalDocs+strings.TrimSuffix(slug, ".md")+">; rel=\"canonical\"")
			}
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("Content-Security-Policy", policy)
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Content-Length", strconv.Itoa(len(data)))
			if r.Method == http.MethodGet {
				_, _ = w.Write(data)
			}
			return
		}
		if strings.HasPrefix(path, "images/") {
			if !fs.ValidPath(path) || strings.Count(path, "/") != 1 || !strings.HasSuffix(path, ".png") {
				http.NotFound(w, r)
				return
			}
			data, err := readPage(path)
			if err != nil {
				http.NotFound(w, r)
				return
			}
			w.Header().Set("Content-Type", "image/png")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("Content-Security-Policy", policy)
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Content-Length", strconv.Itoa(len(data)))
			if r.Method == http.MethodGet {
				_, _ = w.Write(data)
			}
			return
		}
		// Provider guides historically use extensionless relative links.
		// Resolve them to the same checked-in Markdown as their .md siblings.
		if !strings.HasSuffix(path, ".md") {
			path += ".md"
		}
		if !fs.ValidPath(path) || !allowed[path] {
			http.NotFound(w, r)
			return
		}
		source, err := readPage(path)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		summary := metadataValue(source, "summary")
		source = publicBody(source)
		title := guideTitle(source)
		var content, out bytes.Buffer
		doc := renderer.Parser().Parse(text.NewReader(source))
		var current navPage
		var category string
		var ordered []navPage
		position := -1
		for _, group := range groups {
			for _, page := range group.Pages {
				if page.Href == "/docs/"+strings.TrimSuffix(path, ".md") {
					current = page
					category = group.Title
					position = len(ordered)
				}
				ordered = append(ordered, page)
			}
		}
		headings, _ := documentSections(doc, source, current, category)
		var previous, next *navPage
		if position > 0 {
			previous = &ordered[position-1]
		}
		if position >= 0 && position+1 < len(ordered) {
			next = &ordered[position+1]
		}
		if err = renderer.Renderer().Render(&content, source, doc); err != nil {
			http.Error(w, "Guide unavailable", http.StatusInternalServerError)
			return
		}
		rendered := strings.ReplaceAll(content.String(), "<table>", `<div class="docs-table" role="region" tabindex="0" aria-label="Scrollable reference table"><table>`)
		rendered = strings.ReplaceAll(rendered, "<pre>", `<pre tabindex="0" aria-label="Code example">`)
		rendered = strings.ReplaceAll(rendered, "</table>", `</table></div><p class="docs-table-note">Scroll horizontally to see more columns on smaller screens.</p>`)
		// One indexable address per guide: the extensionless path on the public
		// documentation host. The ".md" sibling of this path, and any other host
		// that mounts this handler, render the same document, so they must not
		// compete with it in search results.
		canonical := canonicalDocs
		if path != "README.md" {
			canonical += strings.TrimSuffix(path, ".md")
		}
		if err = shell.Execute(&out, struct {
			Title          string
			Body           template.HTML
			Groups         []navGroup
			Home           bool
			Headings       []headingLink
			Category       string
			Previous, Next *navPage
			Script         string
			Logo           string
			CSS            []string
			Summary        string
			Canonical      string
			Styles         template.CSS
			Icon           string
			IconFallback   string
		}{title, template.HTML(rendered), navigation(path), path == "README.md", headings, category, previous, next, script, logo, css, summary, canonical, template.CSS(styles), icon, iconFallback}); err != nil {
			http.Error(w, "Guide unavailable", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Content-Security-Policy", policy)
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Content-Length", strconv.Itoa(out.Len()))
		if r.Method == http.MethodGet {
			_, _ = w.Write(out.Bytes())
		}
	})
}
