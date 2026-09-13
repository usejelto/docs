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

## Verify

Launch the app after enabling telemetry in your own app. Register `export_finished` and its `format` property in **Settings → Events & funnels → Events** before sending the example. Trigger an export, then inspect the product's app activity and Goals for the current date. Allow up to one minute after changing event registration.

The SDK sends daily activity and queues the first install claim with a delay of up to six hours. A new integration can therefore send activity before an install appears. Release versions support version-adoption reporting; later version changes are reported without creating a new install. Retention requires elapsed time and a mature sample.

If data is missing, check the product ID, registered app slug, collection permission and network access. Debug payload logging is for local diagnosis only; turn it off before distributing a build. Do not reset the install ID on each launch. See [Understand app usage](../guides/understand-app-usage.md).

## Collection lifecycle

`jelto.setProps({ license: 'paid' })` updates install properties. `jelto.disable()` wipes analytics state and stops subsequent collection until another authorized initialization. `jelto.reset()` rotates the install identity. Keep each running app process's analytics storage separate.

Test both a development build and the packaged app: packaging can omit a runtime dependency even when development imports work.
