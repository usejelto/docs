package docs

import (
	"bytes"
	"encoding/json"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"
)

type headingLink struct {
	Title string
	ID    string
	Level int
}

type searchSection struct {
	Title    string `json:"title"`
	Category string `json:"category"`
	Heading  string `json:"heading"`
	Text     string `json:"text"`
	URL      string `json:"url"`
}

// Both navigation and search consume the rendered document's AST. Duplicate and
// punctuated heading IDs therefore agree with the public guide's anchor links.
func documentSections(doc ast.Node, source []byte, page navPage, category string) ([]headingLink, []searchSection) {
	var headings []headingLink
	sections := []searchSection{{Title: page.Title, Category: category, URL: page.Href}}
	var body strings.Builder
	flush := func() {
		sections[len(sections)-1].Text = strings.Join(strings.Fields(body.String()), " ")
		body.Reset()
	}
	_ = ast.Walk(doc, func(n ast.Node, entering bool) (ast.WalkStatus, error) {
		if !entering {
			if n.Type() == ast.TypeBlock {
				body.WriteByte(' ')
			}
			return ast.WalkContinue, nil
		}
		if h, ok := n.(*ast.Heading); ok {
			title := string(h.Text(source))
			id, _ := h.AttributeString("id")
			anchor, _ := id.([]byte)
			if h.Level > 1 {
				headings = append(headings, headingLink{title, string(anchor), h.Level})
				flush()
				sections = append(sections, searchSection{Title: page.Title, Category: category, Heading: title, URL: page.Href + "#" + string(anchor)})
			}
		}
		switch node := n.(type) {
		case *ast.Text:
			body.Write(node.Segment.Value(source))
			if node.SoftLineBreak() || node.HardLineBreak() {
				body.WriteByte(' ')
			}
		case *ast.String:
			body.Write(node.Value)
		case *ast.FencedCodeBlock:
			for i := 0; i < node.Lines().Len(); i++ {
				line := node.Lines().At(i)
				body.Write(line.Value(source))
			}
		case *ast.CodeBlock:
			for i := 0; i < node.Lines().Len(); i++ {
				line := node.Lines().At(i)
				body.Write(line.Value(source))
			}
		}
		return ast.WalkContinue, nil
	})
	flush()
	return headings, sections
}

func searchIndex(renderer goldmark.Markdown, groups []navGroup) []byte {
	var sections []searchSection
	for _, group := range groups {
		for _, page := range group.Pages {
			source, err := readPage(strings.TrimPrefix(page.Href, "/docs/") + ".md")
			if err != nil {
				panic(err)
			}
			source = publicBody(source)
			doc := renderer.Parser().Parse(text.NewReader(source))
			_, found := documentSections(doc, source, page, group.Title)
			sections = append(sections, found...)
		}
	}
	var out bytes.Buffer
	if err := json.NewEncoder(&out).Encode(sections); err != nil {
		panic(err)
	}
	return out.Bytes()
}
