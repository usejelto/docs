---
title: "Install on Next.js"
group: install
slug: install/nextjs
summary: "Load Jelto once in the App Router root layout and verify client navigation."
---

# Install on Next.js

Install the website tracker in the App Router root layout so it runs across your application.

## Before you start

Register your production hostname and copy the script values from **Settings → Installation**. This guide uses Next.js App Router; you only edit your own Next.js project.

## Add the script

1. Open `app/layout.tsx`, or `src/app/layout.tsx` if your project uses `src`.
2. Import `Script` from `next/script`.
3. Add the component once in the existing root layout, using your copied values:

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script id="jelto" strategy="afterInteractive"
          src="YOUR_SCRIPT_URL"
          data-product="YOUR_PRODUCT_ID"
          data-endpoint="YOUR_INGEST_ENDPOINT" />
      </body>
    </html>
  )
}
```

Keep your existing layout content, providers and metadata. Replace the uppercase placeholders with your product's values. Additional `data-*` attributes are forwarded by Next.js to the script.

4. Build and deploy the application using your normal production workflow.

## Verify

Open the published homepage, use a Next.js link to open another route, and use Back. Check those pages in Jelto and run [installation verification](../start/verify.md).

## Common problems

Do not add the tracker to each page or send an extra manual pageview for navigation already handled by Jelto. Code that sends a custom goal must run in the browser after the script has loaded; it cannot run in a Server Component. If you enforce CSP, permit the actual script and ingestion hosts and preserve your nonce policy.

Platform reference: [Next.js script loading](https://nextjs.org/docs/app/guides/scripts).
