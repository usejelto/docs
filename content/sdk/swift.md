---
title: "Swift SDK"
group: sdk
slug: sdk/swift
summary: "Initialize Jelto in a macOS app and send a custom action."
---

# Swift SDK

Measure active macOS installs, app versions and custom actions from your app.

## Set up with AI

For a copyable setup prompt with your app details, open **Settings → Installation
→ Apps**, expand your app's **SDK setup**, choose **Swift** and select **Copy prompt**.
The prompt names the package described below. See
[Set up with AI](../start/apps.md#set-up-with-ai) for what to expect.

## Setup steps

1. Add the **Jelto** Swift package to your app target.
2. Initialize it once in the app startup flow, using the product ID and registered app slug.
3. Send an event from the action that succeeds, then verify it in the dashboard.

## Install

Requires macOS 12 or later. In Xcode, open **File → Add Package Dependencies**, enter `https://github.com/usejelto/swift-sdk`, choose the latest release, and add the **Jelto** product to your app target. In a `Package.swift` manifest, add the same URL as a package dependency and `Jelto` as a dependency of your app target. Releases are listed at [usejelto/swift-sdk](https://github.com/usejelto/swift-sdk/releases).

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

Launch the app after enabling telemetry in your own app. Trigger an export, then inspect the product's app activity and Goals for the current date. Jelto discovers `export_finished` and its `format` property when it receives the event; no event registration is required.

The SDK sends daily activity and queues the first install claim with a delay of up to six hours. A new integration can therefore send activity before an install appears. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Respect app choices

Use `Jelto.disable()` when collection must stop and local analytics state should be wiped. `Jelto.reset()` rotates the install identity; it is not a routine startup call. `Jelto.installId` can support an app-data request. Do not use it to identify a website visitor.

For onboarding milestones, `Jelto.onboarding("welcome", status: "ok")` reports a built-in onboarding event with no event registration required.
