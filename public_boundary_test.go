package docs

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPublicSurfacesExcludePlatformImplementation(t *testing.T) {
	handler := NewHandler()
	routes := []string{"/docs/", "/docs/search-index.json", "/docs/llms.txt"}
	for _, group := range navigation("") {
		for _, page := range group.Pages {
			routes = append(routes, page.Href, "/docs/agents/"+strings.TrimPrefix(page.Href, "/docs/")+".md")
		}
	}
	// These are concrete regressions from earlier public guides, plus the private
	// source metadata that every public representation must strip.
	forbidden := []string{"keyed HMAC", "worker removes expired rows", "email indexes", "durable revenue ledger", "resumable cursor", "Jelto serializes each total", "trusted-IP-header", "Operator setup guide", "deployment Origin for CSRF", "web/dashboard/", "cmd/jelto/", "internal/store/", "implements:", "verified:"}
	for _, route := range routes {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest("GET", route, nil))
		if response.Code != 200 {
			t.Fatalf("%s: %d", route, response.Code)
		}
		body := strings.ToLower(response.Body.String())
		for _, term := range forbidden {
			if strings.Contains(body, strings.ToLower(term)) {
				t.Errorf("%s exposes %q", route, term)
			}
		}
	}
}

func TestCustomerIntegrationInstructionsRemainPublic(t *testing.T) {
	handler := NewHandler()
	for _, example := range []struct{ route, text string }{
		{"/docs/sdk/analytics", "@jelto/analytics/server"},
		{"/docs/sdk/crawler", "JELTO_CRAWLER_KEY"},
		{"/docs/api/website", "/api/v1/payments"},
		{"/docs/install/nextjs", "next/script"},
		{"/docs/payments/paddle", "PADDLE_WEBHOOK_SECRET"},
		{"/docs/payments/browser-attribution", "pseudonymous"},
	} {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest("GET", example.route, nil))
		if response.Code != 200 || !strings.Contains(response.Body.String(), example.text) {
			t.Errorf("lost customer integration guidance: %s (%s)", example.route, example.text)
		}
	}
}
