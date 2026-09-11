---
title: "Mac App Store distribution"
group: sdk
slug: distribution/app-store
summary: "Measure activity in a Store-distributed app and understand acquisition and payment coverage."
---

# Mac App Store distribution

The Jelto SDK can measure app activity after launch. It does not automatically import App Store Connect reports or identify which website visitor installed the app.

## Install and verify the SDK

1. Follow the [Swift SDK guide](../sdk/swift.md).
2. In the app target's App Sandbox capability, enable **Outgoing Connections (Client)** so the app can send analytics when permitted.
3. Initialize after your app's telemetry choice and test the signed, packaged build.
4. Check app activity and versions. Allow time for the first install claim and retention history.

Apple documents the [outgoing-network entitlement](https://developer.apple.com/documentation/BundleResources/Entitlements/com.apple.security.network.client). The SDK stores its local state within the app's sandboxed application-support location.

## Acquisition coverage

A tracked website link to an App Store listing is an outbound click, not a downloaded app binary. Store search or browsing produces no Jelto website pageview. App installs therefore cannot be interpreted as completed website funnel steps.

If you need to distinguish a Store build from a directly distributed build, register different app slugs and initialize each build with the intended slug. This is build-level grouping, not visitor attribution.

## Revenue

Jelto does not automatically connect App Store purchases. Your server must verify the provider transaction before sending a payment through the authenticated [Payments API](../api/website.md). Keep the scoped key on your server, reuse the provider transaction ID when retrying and preserve the actual amount and date.

When an app payment carries an `install_id`, do not also send a website `cohort`; the two are mutually exclusive. Never send revenue amounts through the public browser/app event collector.

App Store Connect sales and proceeds use Apple's own definitions. Do not assume they will equal SDK-observed installs or a Jelto reporting-currency estimate.
