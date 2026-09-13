package docs

import (
	"embed"
	"encoding/json"
	"io/fs"
	"net/http"
	"path"
	"strconv"
	"strings"
)

//go:embed dist
var frontend embed.FS

type frontendEntry struct {
	File    string   `json:"file"`
	CSS     []string `json:"css"`
	IsEntry bool     `json:"isEntry"`
}

func frontendManifest() map[string]frontendEntry {
	data, err := frontend.ReadFile("dist/manifest.json")
	if err != nil {
		return nil
	}
	var manifest map[string]frontendEntry
	if json.Unmarshal(data, &manifest) != nil {
		return nil
	}
	return manifest
}

func frontendFiles() (string, []string, string) {
	manifest := frontendManifest()
	if manifest == nil {
		return "", nil, ""
	}
	logo := ""
	if entry, ok := manifest["web/vendor/brand/mascot-mark.svg"]; ok {
		logo = "/docs/" + entry.File
	}
	for _, entry := range manifest {
		if entry.IsEntry {
			return "/docs/" + entry.File, entry.CSS, logo
		}
	}
	return "", nil, logo
}

// frontendIcons names the browser icons: the SVG most browsers use and the ICO
// that Safari, which ignores SVG icons, falls back to. Both are brand inputs
// (web/vendor/brand, docs-brand in the backend's components.json) emitted with
// content-hashed names; without a build the head declares no icon.
func frontendIcons() (svg, ico string) {
	manifest := frontendManifest()
	if entry, ok := manifest["web/vendor/brand/favicon.svg"]; ok {
		svg = "/docs/" + entry.File
	}
	if entry, ok := manifest["web/vendor/brand/favicon.ico"]; ok {
		ico = "/docs/" + entry.File
	}
	return svg, ico
}

func serveFrontend(w http.ResponseWriter, r *http.Request, name string) {
	contentTypes := map[string]string{".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8"}
	kind := contentTypes[path.Ext(name)]
	if !fs.ValidPath(name) || strings.Count(name, "/") != 1 || kind == "" {
		http.NotFound(w, r)
		return
	}
	data, err := frontend.ReadFile("dist/" + name)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", kind)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	// Assets are subresources, on which a CSP header is inert, but an SVG opened
	// as a document would run in the dashboard origin with no policy at all. A
	// sandboxed, source-less policy makes a future brand-asset swap inert.
	w.Header().Set("Content-Security-Policy", "default-src 'none'; sandbox")
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Header().Set("Content-Length", strconv.Itoa(len(data)))
	if r.Method == http.MethodGet {
		_, _ = w.Write(data)
	}
}
