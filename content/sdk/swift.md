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

## Onboarding and custom events

The onboarding call sends `onboarding:<step>` with a status and optional reason:

```swift
Jelto.onboarding("welcome", status: "ok")
Jelto.onboarding("permissions", status: "fail", reason: "denied")
```

The step must match `^[a-z0-9_-]{1,32}$`: 1–32 lowercase ASCII letters, digits, underscores or hyphens. Status must be `ok`, `fail` or `skip`. A non-empty reason must match `^[a-z0-9_.-]+$` and be at most 64 characters; an omitted or empty reason sends no reason property. If any of these values falls outside the grammar or length cap, the whole event is dropped. The rejection is visible only in debug logging, not in the dashboard.

Enable local debug logging with `Jelto.debug = true`.

Steps feed `onboarding_reached`, `onboarding_ok`, `onboarding_fail` and `onboarding_skip`, broken down by `onboarding_step`; status reports use each install's first result for that step. They also feed `onboarding_reason`, which groups failures by `onboarding_reason` and requires an `onboarding_step` filter. `onboarding_cohort` supplies the install population, and `onboarding_completed` uses the final step's `ok` result.

Every valid `Jelto.track()` event received by Jelto becomes `goal:<name>` on the app surface, with per-install conversion and `prop:<key>` breakdowns. Custom events and their property keys are discovered on first receipt; no event or goal registration is required. For the export example, query `goal:export_finished` with `surface=app` and `dimension=prop:format`.

The source of truth for these SDK event contracts is [spec/wire-v1.md §4](https://github.com/usejelto/contracts/blob/main/spec/wire-v1.md#4-reserved-event-names); §7 of the same document defines custom event discovery.

## License properties

Update the install's license when its state changes:

```swift
Jelto.setProps(["license": "paid"])
```

Accepted license values are strings matching `^[a-z0-9_.-]{1,24}$`, such as `free`, `trial`, `paid` or `expired`; these examples are not a fixed enum. Uppercase letters, spaces and values longer than 24 characters are rejected. `license_share` breaks the live install fleet down by the stored `license` value. `license_conversion` counts an install as converted only when its latest stored `license` equals the product's `paid_license_value` setting by string equality; the setting defaults to `paid`. If no stored values ever match, an otherwise reportable cohort stays at a true, permanent 0 % even though the query succeeds; align the value in the product settings or through the account API's `paid_license_value` field.

## Verify

Launch the app after enabling telemetry in your own app. Trigger an export, then inspect the product's app activity and Goals for the current date. Jelto discovers `export_finished` and its `format` property when it receives the event; no event registration is required.

The SDK sends daily activity and queues the first install claim immediately on first initialization. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Respect app choices

Use `Jelto.disable()` when collection must stop and local analytics state should be wiped. `Jelto.reset()` rotates the install identity; it is not a routine startup call. `Jelto.installId` can support an app-data request. Do not use it to identify a website visitor.

For onboarding milestones, `Jelto.onboarding("welcome", status: "ok")` reports a built-in onboarding event with no event registration required.

## Track updater outcomes

Use the existing tracking API to send `app_update` stages, failures, and explicit postponements. They appear under **App updates → Update activity**, separately from version changes confirmed on launch. See [Track update activity](../guides/understand-app-usage.md#track-update-activity) for properties and updater callbacks.
