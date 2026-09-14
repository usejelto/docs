---
title: "Electron Forge SDK"
group: sdk
slug: sdk/electron-forge
summary: "Run Jelto in the Electron Forge main process and forward only declared app actions."
---

# Electron Forge SDK

Measure desktop app activity from the Electron main process.

## Set up with AI

For a copyable setup prompt with your app details, open **Settings → Installation
→ Apps**, expand your app's **SDK setup**, choose **Electron** and select **Copy prompt**.
The prompt names the package described below. See
[Set up with AI](../start/apps.md#set-up-with-ai) for what to expect.

## Setup steps

1. Install `@jelto/electron` as a runtime dependency.
2. Add initialization to the main-process entry used by Electron Forge.
3. Send declared actions from validated main-process handlers.
4. Verify both development and packaged builds.

## Install

Node.js 18 or later is required. The package is published on npm as `@jelto/electron`; its source and releases are at [usejelto/electron-sdk](https://github.com/usejelto/electron-sdk). Install it in your app project:

```sh
npm install @jelto/electron
```

Include it in your packaged app's runtime dependencies, not only in development dependencies.

## Initialize in the main process

Add the initialization to the main-process file referenced by your Forge app, commonly `src/index.ts`. Keep your existing window-creation code. The `analyticsAllowed` argument below comes from your app's saved telemetry choice.

```ts
import { app } from 'electron'
import jelto from '@jelto/electron'

async function startAnalytics(analyticsAllowed: boolean) {
  await app.whenReady()
  if (analyticsAllowed) jelto.init('YOUR_PRODUCT_ID', 'desktop')
}
```

Call `startAnalytics` from your app's startup flow. The app slug must match **Settings → Installation → Apps**.

In an existing, validated main-process action handler, report:

```ts
jelto.track('export_finished', { format: 'pdf' })
```

## Renderer actions

Keep the SDK in the main process. If an action starts in the renderer, expose a narrow method through your existing preload bridge and IPC handler. For example, forward an export-completed action with an allowlisted format. Do not expose arbitrary event names, arbitrary payload forwarding or SDK initialization to remote renderer content.

## Onboarding and custom events

The onboarding call sends `onboarding:<step>` with a status and optional reason:

```ts
jelto.onboarding('permissions', 'ok')
jelto.onboarding('permissions', 'fail', 'denied')
```

The step must match `^[a-z0-9_-]{1,32}$`: 1–32 lowercase ASCII letters, digits, underscores or hyphens. Status must be `ok`, `fail` or `skip`. A non-empty reason must match `^[a-z0-9_.-]+$` and be at most 64 characters; an omitted or empty reason sends no reason property. If any of these values falls outside the grammar or length cap, the whole event is dropped. The rejection is visible only in debug logging, not in the dashboard.

Enable local debug logging with `JELTO_DEBUG=1`.

Steps feed `onboarding_reached`, `onboarding_ok`, `onboarding_fail` and `onboarding_skip`, broken down by `onboarding_step`; status reports use each install's first result for that step. They also feed `onboarding_reason`, which groups failures by `onboarding_reason` and requires an `onboarding_step` filter. `onboarding_cohort` supplies the install population, and `onboarding_completed` uses the final step's `ok` result.

Every valid `jelto.track()` event received by Jelto becomes `goal:<name>` on the app surface, with per-install conversion and `prop:<key>` breakdowns. Custom events and their property keys are discovered on first receipt; no event or goal registration is required. For the export example, query `goal:export_finished` with `surface=app` and `dimension=prop:format`.

The source of truth for these SDK event contracts is [spec/wire-v1.md §4](https://github.com/usejelto/contracts/blob/main/spec/wire-v1.md#4-reserved-event-names); §7 of the same document defines custom event discovery.

## License properties

Update the install's license when its state changes:

```ts
jelto.setProps({ license: 'paid' })
```

Accepted license values are strings matching `^[a-z0-9_.-]{1,24}$`, such as `free`, `trial`, `paid` or `expired`; these examples are not a fixed enum. Uppercase letters, spaces and values longer than 24 characters are rejected. `license_share` breaks the live install fleet down by the stored `license` value. `license_conversion` counts an install as converted only when its latest stored `license` equals the product's `paid_license_value` setting by string equality; the setting defaults to `paid`. If no stored values ever match, an otherwise reportable cohort stays at a true, permanent 0 % even though the query succeeds; align the value in the product settings or through the account API's `paid_license_value` field.

## Verify

Launch the app after enabling telemetry in your own app. Trigger an export, then inspect the product's app activity and Goals for the current date. Jelto discovers `export_finished` and its `format` property when it receives the event; no event registration is required.

The SDK sends daily activity and queues the first install claim with a delay of up to six hours. A new integration can therefore send activity before an install appears. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Collection lifecycle

`jelto.setProps({ license: 'paid' })` updates install properties. `jelto.disable()` wipes analytics state and stops subsequent collection until another authorized initialization. `jelto.reset()` rotates the install identity. Keep each running app process's analytics storage separate.

Test both a development build and the packaged app: packaging can omit a runtime dependency even when development imports work.

## Track updater outcomes

Use the existing tracking API to send `app_update` stages, failures, and explicit postponements. They appear under **App updates → Update activity**, separately from version changes confirmed on launch. See [Track update activity](../guides/understand-app-usage.md#track-update-activity) for properties and updater callbacks.
