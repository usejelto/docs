---
title: "winget distribution"
group: sdk
slug: distribution/winget
summary: "Understand app activity and missing website-click coverage for winget installs."
---

# winget distribution

A winget installation fetches the installer from its manifest. It does not execute your website JavaScript, even when the file is hosted on your domain.

## Set up app tracking

1. Follow the [app installation guide](../start/apps.md) and add the appropriate SDK to your distributed app.
2. Initialize after your app permits analytics, using the registered app slug.
3. Test the actual packaged app, not only a browser download page.

## Read the numbers

App activity, versions and retention describe SDK observations after launch. Installing through the package manager does not create a Jelto website download click or attach a website marketing channel to an app install.

The download-to-install metric compares totals for the chosen period. Installs from package managers may have no corresponding website click, so the populations differ and a percentage may be unavailable. Do not read it as the percentage of individual downloaders who installed.

A real `.dmg`, `.exe` or other supported file link on a tracked website can produce a download click. To measure copying an installation command, send a [custom event](../goals/create-goal.md) after the copy succeeds. Jelto discovers the goal on receipt; copying a command does not establish a download or installation.

## Verify

Launch a packaged build with analytics enabled and check app activity. Check a real website file link separately. The two observations do not establish an identity link.

For app payments, see [App Store revenue](app-store.md#revenue) and the [Payments API](../api/website.md). Package-manager analytics are a separate reporting source; Jelto does not automatically import them.
