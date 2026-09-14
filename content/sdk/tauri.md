---
title: "Tauri SDK"
group: sdk
slug: sdk/tauri
summary: "Register the Tauri 2 plugin and initialize analytics after your app permits it."
---

# Tauri SDK

Measure desktop app activity through the Tauri plugin and its local application bridge.

## Set up with AI

For a copyable setup prompt with your app details, open **Settings → Installation
→ Apps**, expand your app's **SDK setup**, choose **Tauri** and select **Copy prompt**.
The prompt names the packages described below. See
[Set up with AI](../start/apps.md#set-up-with-ai) for what to expect.

## Setup steps

1. Install the JavaScript package from npm and the Rust plugin from crates.io.
2. Register the plugin in your Rust builder and add its permission to the local window capability.
3. Initialize once after the app permits telemetry, then send custom actions.
4. Launch the packaged app and verify the results.

## Install

This integration targets Tauri 2 on macOS, Windows and Linux. The JavaScript bindings are published on npm as `@jelto/tauri` and the Rust plugin on crates.io as `tauri-plugin-jelto`; source and releases are at [usejelto/tauri-sdk](https://github.com/usejelto/tauri-sdk). Install matching current releases in your app project:

```sh
npm install @jelto/tauri
cd src-tauri
cargo add tauri-plugin-jelto
```

## Register the plugin

In your app's Rust builder, add this call before the existing `.run(...)`:

```rust
.plugin(tauri_plugin_jelto::init())
```

In the capability file for the local app window, add `"jelto:default"` to its existing `permissions` array. Keep the rest of the capability unchanged and limit it to your intended local window.

## Initialize and track

Call initialization after your own telemetry decision, then report actions from their successful handlers:

```ts
import jelto from '@jelto/tauri'

await jelto.init('YOUR_PRODUCT_ID', 'desktop')
// Later, after an export succeeds:
await jelto.track('export_finished', { format: 'pdf' })
```

The `desktop` slug must be registered in **Settings → Installation → Apps**. The plugin collects desktop activity for your app; do not add a browser tracker for the same activity.

## Onboarding and custom events

The onboarding call sends `onboarding:<step>` with a status and optional reason:

```ts
await jelto.onboarding('permissions', 'ok')
await jelto.onboarding('permissions', 'fail', 'denied')
```

The step must match `^[a-z0-9_-]{1,32}$`: 1–32 lowercase ASCII letters, digits, underscores or hyphens. Status must be `ok`, `fail` or `skip`. A non-empty reason must match `^[a-z0-9_.-]+$` and be at most 64 characters; an omitted or empty reason sends no reason property. If any of these values falls outside the grammar or length cap, the whole event is dropped. The rejection is visible only in debug logging, not in the dashboard.

Enable local debug logging with `JELTO_DEBUG=1`.

Steps feed `onboarding_reached`, `onboarding_ok`, `onboarding_fail` and `onboarding_skip`, broken down by `onboarding_step`; status reports use each install's first result for that step. They also feed `onboarding_reason`, which groups failures by `onboarding_reason` and requires an `onboarding_step` filter. `onboarding_cohort` supplies the install population, and `onboarding_completed` uses the final step's `ok` result.

Every valid `jelto.track()` event received by Jelto becomes `goal:<name>` on the app surface, with per-install conversion and `prop:<key>` breakdowns. Custom events and their property keys are discovered on first receipt; no event or goal registration is required. For the export example, query `goal:export_finished` with `surface=app` and `dimension=prop:format`.

The source of truth for these SDK event contracts is [spec/wire-v1.md §4](https://github.com/usejelto/contracts/blob/main/spec/wire-v1.md#4-reserved-event-names); §7 of the same document defines custom event discovery.

## License properties

Update the install's license when its state changes:

```ts
await jelto.setProps({ license: 'paid' })
```

Accepted license values are strings matching `^[a-z0-9_.-]{1,24}$`, such as `free`, `trial`, `paid` or `expired`; these examples are not a fixed enum. Uppercase letters, spaces and values longer than 24 characters are rejected. `license_share` breaks the live install fleet down by the stored `license` value. `license_conversion` counts an install as converted only when its latest stored `license` equals the product's `paid_license_value` setting by string equality; the setting defaults to `paid`. If no stored values ever match, an otherwise reportable cohort stays at a true, permanent 0 % even though the query succeeds; align the value in the product settings or through the account API's `paid_license_value` field.

## Verify

Launch the app after enabling telemetry in your own app. Trigger an export, then inspect the product's app activity and Goals for the current date. Jelto discovers `export_finished` and its `format` property when it receives the event; no event registration is required.

The SDK sends daily activity and queues the first install claim with a delay of up to six hours. A new integration can therefore send activity before an install appears. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Lifecycle

The asynchronous methods also include `setProps`, `onboarding`, `installId`, `reset` and `disable`. `disable` wipes local analytics state; `reset` rotates identity. Multiple app windows share one engine. Do not initialize separate products in different windows of the same process.

If calls do nothing, check the plugin registration and the target window's capability before changing network settings.

## Track updater outcomes

Use the existing tracking API to send `app_update` stages, failures, and explicit postponements. They appear under **App updates → Update activity**, separately from version changes confirmed on launch. See [Track update activity](../guides/understand-app-usage.md#track-update-activity) for properties and updater callbacks.
