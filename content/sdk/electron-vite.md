---
title: "Electron Vite SDK"
group: sdk
slug: sdk/electron-vite
summary: "Run Jelto in the Electron Vite main process and forward only declared app actions."
---

# Electron Vite SDK

Measure desktop app activity from the Electron main process.

> **Not published yet.** The SDK package is prepared but has no public installation address yet. Replace the uppercase installation placeholders below after publication. They are not working registry coordinates.

## Set up with AI

For a copyable setup prompt with your app details, open **Settings → Installation
→ Apps**, expand your app's **SDK setup**, choose **Electron** and select **Copy prompt**.
The prompt uses the installation placeholders described below. See
[Set up with AI](../start/apps.md#set-up-with-ai) for what to expect.

## Setup steps

1. Install the published runtime dependency.
2. Add initialization to the Electron Vite main-process entry.
3. Send declared actions from validated main-process handlers.
4. Verify both development and packaged builds.

## Install when published

Node.js 18 or later is required. Install the published runtime package in your app project, replacing the placeholder first:

```sh
npm install REPLACE_WITH_PUBLISHED_JELTO_ELECTRON_PACKAGE
```

The prepared package's import is `@jelto/electron`. Include it in your packaged app's runtime dependencies.

## Initialize in the main process

Add the initialization to `src/main/index.ts`, or the main entry configured by your Electron Vite project. Keep your existing window-creation code. The `analyticsAllowed` argument below comes from your app's saved telemetry choice.

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
