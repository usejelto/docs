package docs

import (
	"bytes"
	"fmt"
	"net/url"
	"regexp"
	"strings"
)

const canonicalDocs = "https://jelto.io/docs/"

var markdownDestination = regexp.MustCompile(`\]\(([^)\s]+)\)`)

func publicBody(source []byte) []byte {
	if bytes.HasPrefix(source, []byte("---\n")) {
		if end := bytes.Index(source[4:], []byte("\n---\n")); end >= 0 {
			return source[4+end+5:]
		}
	}
	return source
}

// Agent responses are derived from the same embedded public sources as HTML.
// A clean build therefore does not depend on ignored generator output.
func agentPage(source []byte, slug string, page navPage, group navGroup) []byte {
	body := strings.TrimSpace(string(publicBody(source)))
	if strings.HasPrefix(body, "# ") {
		if end := strings.IndexByte(body, '\n'); end >= 0 {
			body = strings.TrimLeft(body[end:], "\n")
		}
	}
	base, _ := url.Parse(canonicalDocs + slug)
	body = markdownDestination.ReplaceAllStringFunc(body, func(match string) string {
		href := match[2 : len(match)-1]
		ref, err := url.Parse(href)
		if err != nil || ref.IsAbs() {
			return match
		}
		target := base.ResolveReference(ref)
		if strings.HasPrefix(target.Path, "/docs/") && strings.HasSuffix(target.Path, ".md") {
			target.Path = strings.TrimSuffix(target.Path, ".md")
		}
		if target.Path == "/docs/README" {
			target.Path = "/docs/"
		}
		return "](" + target.String() + ")"
	})
	return []byte(fmt.Sprintf("# %s\n\n%s\n\nCanonical page: %s%s\nSection: %s\n\n---\n\n%s\n", page.Title, page.Summary, canonicalDocs, slug, group.Title, body))
}

func agentIndex(groups []navGroup) []byte {
	var out strings.Builder
	out.WriteString("# Jelto documentation\n\n> Setup and user guides for website and desktop app analytics.\n\nStart here: " + canonicalDocs + "\n\n")
	for _, group := range groups {
		fmt.Fprintf(&out, "## %s\n\n%s\n\n", group.Title, group.Description)
		for _, page := range group.Pages {
			slug := strings.TrimPrefix(page.Href, "/docs/")
			fmt.Fprintf(&out, "- [%s](%sagents/%s.md): %s\n", page.Title, canonicalDocs, slug, page.Summary)
		}
		out.WriteByte('\n')
	}
	return []byte(out.String())
}
