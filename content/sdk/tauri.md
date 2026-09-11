---
title: "Tauri SDK"
group: sdk
slug: sdk/tauri
summary: "Register the Tauri 2 plugin and initialize analytics after your app permits it."
---

# Tauri SDK

Measure desktop app activity through the Tauri plugin and its local application bridge.

> **Not published yet.** The SDK package is prepared but has no public installation address yet. Replace the uppercase installation placeholders below after publication. They are not working registry coordinates.

## Set up with AI

For a copyable setup prompt with your app details, open **Settings → Installation
→ Apps**, expand your app's **SDK setup**, choose **Tauri** and select **Copy prompt**.
The prompt uses the installation placeholders described below. See
[Set up with AI](../start/apps.md#set-up-with-ai) for what to expect.

## Setup steps

1. Install the published Rust and JavaScript packages.
2. Register the plugin in your Rust builder and add its permission to the local window capability.
3. Initialize once after the app permits telemetry, then send registered actions.
4. Launch the packaged app and verify the results.

## Install when published

This integration targets Tauri 2 on macOS, Windows and Linux. Use `REPLACE_WITH_PUBLISHED_TAURI_RUST_PACKAGE` and `REPLACE_WITH_PUBLISHED_TAURI_JS_PACKAGE` for the future Rust and JavaScript installation addresses. The prepared interfaces are `tauri-plugin-jelto` and `@jelto/tauri`.

Run the following in your app project after replacing the placeholders:

```sh
npm install REPLACE_WITH_PUBLISHED_TAURI_JS_PACKAGE
cd src-tauri
cargo add REPLACE_WITH_PUBLISHED_TAURI_RUST_PACKAGE
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

## Verify

Launch the app after enabling telemetry in your own app. Register `export_finished` and its `format` property in **Settings → Events & funnels → Events** before sending the example. Trigger an export, then inspect the product's app activity and Goals for the current date. Allow up to one minute after changing event registration.

The SDK sends daily activity and queues the first install claim with a delay of up to six hours. A new integration can therefore send activity before an install appears. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Lifecycle

The asynchronous methods also include `setProps`, `onboarding`, `installId`, `reset` and `disable`. `disable` wipes local analytics state; `reset` rotates identity. Multiple app windows share one engine. Do not initialize separate products in different windows of the same process.

If calls do nothing, check the plugin registration and the target window's capability before changing network settings.
