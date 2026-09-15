---
title: "Connect a desktop app"
group: start
slug: start/apps
summary: "Register an app slug, choose an SDK, and verify the first app activity."
---

# Connect a desktop app

Use an app SDK to measure active installs, versions and custom app events. Adding a website script does not instrument a desktop app.

Already have users? Read [Add Jelto to an app with existing users](existing-app.md)
for install coverage, the first version baseline and cohort limits after adoption.

## Connect the app

When adding a website, enable **This website also has an app** to include **Set up SDK** in the guided setup. You can register the app and copy its SDK prompt there, or skip it and return through Settings later.

1. Open your product's **Settings → Installation → Apps**.
2. Register a short app slug for each app you want to distinguish, such as `desktop`. Use the exact registered slug in initialization.
3. Choose [Swift](../sdk/swift.md), [Electron Forge](../sdk/electron-forge.md), [Electron Vite](../sdk/electron-vite.md), [Tauri](../sdk/tauri.md), or [.NET](../sdk/dotnet.md).
4. Initialize once when your app decides telemetry may start. Classify the installation with `installOrigin` from saved host state: `new`, `existing`, or `unknown`; see [the adoption guide](existing-app.md). Keep secret server API keys out of desktop binaries.
5. [Register custom events](../goals/create-goal.md) before sending them.

## Set up with AI

Open a registered app's **SDK setup** in **Settings → Installation → Apps**.
Choose **Swift**, **Electron**, **Tauri**, or **.NET**, then select **Copy prompt**
under **Set up with AI**. Swift is available for macOS apps. Paste the prompt
into a coding assistant with your app project open.

The English prompt includes your public product ID, registered app identifier,
tracking endpoint, initialization example and SDK guides. It asks the assistant
to inspect your project, preserve telemetry choices, initialize once in the right
startup flow, check builds and explain how to verify app activity. It contains
no secret server API key.

**Packages come from public registries.** The prompt names the published
package for the selected SDK: the **Jelto** Swift package from GitHub,
`@jelto/electron` on npm, `@jelto/tauri` on npm with `tauri-plugin-jelto` on
crates.io, or `Jelto` on NuGet. Your assistant installs the current release with
your project's package manager. It should report any installation error and the
checks that could not run, without claiming a failed installation succeeded.

**View prompt** shows selectable text for review or manual copying. **Install
manually** shows the selected SDK's initialization example; use the linked SDK
guide for package setup. Switching methods keeps your SDK selection. Copying a
prompt or passing a build does not verify incoming app activity.

## Verify app activity

Launch the app and keep it open long enough to send queued activity. Check app metrics in the correct product and date range. The SDK queues daily activity and the first install claim immediately on first initialization. Do not repeatedly reset an install ID to test counts.

Version adoption requires known app versions. Retention needs time and a sufficiently mature sample. Read [Understand app usage](../guides/understand-app-usage.md) before interpreting an empty or unavailable metric.

## Website and app together

You can compare website visits, download clicks and app installs in one product. A download-to-install period ratio does not identify which visitor installed your app. See [distribution channels](../distribution/homebrew.md) for what each delivery method can report.
