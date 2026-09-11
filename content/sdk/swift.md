---
title: "Swift SDK"
group: sdk
slug: sdk/swift
summary: "Initialize Jelto in a macOS app and send a registered action."
---

# Swift SDK

Measure active macOS installs, app versions and registered actions from your app.

> **Not published yet.** The SDK package is prepared but has no public installation address yet. Replace the uppercase installation placeholders below after publication. They are not working registry coordinates.

## Set up with AI

For a copyable setup prompt with your app details, open **Settings → Installation
→ Apps**, expand your app's **SDK setup**, choose **Swift** and select **Copy prompt**.
The prompt uses the installation placeholders described below. See
[Set up with AI](../start/apps.md#set-up-with-ai) for what to expect.

## Setup steps

1. Add the published **Jelto** Swift package to your app target.
2. Initialize it once in the app startup flow, using the product ID and registered app slug.
3. Send an event from the action that succeeds, then verify it in the dashboard.

## Install when published

Requires macOS 12 or later. In Xcode, open **File → Add Package Dependencies**, enter `REPLACE_WITH_PUBLIC_SWIFT_PACKAGE_URL`, choose the published release, and add the **Jelto** product to your app target. The URL is a placeholder until publication.

## Initialize in your app

Call this once in your app startup path, after the app decides analytics may start. Use the app slug registered under **Settings → Installation → Apps**.

```swift
import Jelto

Jelto.initialize(key: "YOUR_PRODUCT_ID", app: "desktop")
Jelto.setProps(["license": "trial"])
```

In the successful export action:

```swift
Jelto.track("export_finished", props: ["format": "pdf"])
```

Calls before initialization do not start collection. The default ingestion endpoint is provided by the SDK; an explicit `endpoint:` is only needed for a configured alternative.

## Verify

Launch the app after enabling telemetry in your own app. Register `export_finished` and its `format` property in **Settings → Events & funnels → Events** before sending the example. Trigger an export, then inspect the product's app activity and Goals for the current date. Allow up to one minute after changing event registration.

The SDK sends daily activity and queues the first install claim with a delay of up to six hours. A new integration can therefore send activity before an install appears. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Respect app choices

Use `Jelto.disable()` when collection must stop and local analytics state should be wiped. `Jelto.reset()` rotates the install identity; it is not a routine startup call. `Jelto.installId` can support an app-data request. Do not use it to identify a website visitor.

For onboarding milestones, `Jelto.onboarding("welcome", status: "ok")` reports an onboarding event; register the corresponding custom event and property keys first.
