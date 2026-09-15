---
title: "Add Jelto to an app with existing users"
group: start
slug: start/existing-app
summary: "Understand install coverage, version history and cohort limits when an established app adopts Jelto."
---

# Add Jelto to an app with existing users

Jelto starts observing an installation when it first runs your SDK-enabled build.
Someone who has used your app for months can therefore appear as a new install
claim on that day. Your app's history before that launch is not imported.

Follow [Connect a desktop app](apps.md) and your SDK's setup guide as usual. Keep
initialization behind your app's telemetry choice and preserve the SDK's install
identity across launches and updates.

## Why the install count starts below your real install base

Only users who upgrade to an SDK-enabled version, open it, permit collection and
successfully send activity can appear in Jelto. Users on older builds, dormant
installations and users who do not permit collection remain unseen.

As more users upgrade and launch, coverage approaches the part of your install
base that reports to Jelto. There is no fixed convergence date or guarantee that
it will equal your historical customer count. The **Installs** metric counts
claims dated within the selected period; reinstalls can add claims, so even
the cumulative total is not a census of distinct machines or customers. The first
wave of claims includes existing users, not just newly acquired users.

Jelto adds an automatic **App measurement started** annotation on the day the
product's first app event is received, displayed in the product's timezone. Use
that boundary on app charts to distinguish the start of measurement from the
app's original launch. It does not mean every user upgraded that day.
For products already using Jelto before this boundary was recorded, there may
not be enough retained history to prove the original boundary, regardless of how
recently the product was created. Jelto leaves the annotation absent when the
date is unknown instead of labelling a later check-in as the start of measurement.

## Why the adopting release has no update event

Suppose version `1.6.0` is your first release with Jelto. On its first launch, the
SDK establishes `1.6.0` as its saved version baseline. It has no previously
observed version to compare, so it cannot automatically emit `app_updated` for
the move from `1.5.0` to `1.6.0`. A later launch of `1.7.0` can report a transition
from the saved `1.6.0` baseline.

Version history starts at the first SDK-enabled version each installation
reports. It does not start at your app's first published release. Users who skip
`1.6.0` and first run Jelto in `1.7.0` start there instead. An update feed can tell
Jelto which version is published; it cannot reconstruct those users' earlier
versions or update events.

## Which readings you can use immediately

Heartbeat-based readings describe the installations that actually report. They
do not need a month of history, but their date and sample rules still apply.

| Reading | What it can tell you after adoption |
| --- | --- |
| Active installs today or in the selected range | How many observed installations checked in. Today is partial; it will grow as more users open the app. |
| Version distribution and % on latest | Which versions checked in on the reference day. The percentage also requires a configured published version and a sufficient sample. |
| License share | The latest reported license composition of the observed fleet as of the reference day, using its 30-day activity window. Send the current `license` property, including for existing customers. |
| Quiet installs | Which previously observed installations stopped checking in for at least 14 days. This needs its own activity history and cannot identify users who never ran the SDK. |

The reference day is the last completed day in the selected range. On the first
day of collection, reference-day cards may have no check-ins yet even while
today's activity is arriving. A license card waiting for that first full day does
not mean your app failed to send its license property. Small samples may show
counts without a percentage.

## Cohorts need time, and the adoption wave needs care

A cohort groups **explicitly new** installations by their claim's event day in
the product's timezone. Existing installations use the **Predates Jelto** age
bucket; installations with no host classification use **App age unknown**.
Neither bucket advances into a numeric age. An installation's missing history
cannot be recovered by waiting.

Retention needs the entire return day to close in the product's timezone:

| Reading | Earliest completed result for a cohort starting on day 0 |
| --- | --- |
| D1 retention | Start of day 2, after day 1 closes |
| D7 retention | Start of day 8, after day 7 closes |
| D30 retention, including a retained-D30 KPI | Start of day 31, after day 30 closes: roughly a month after adoption |

These are maturity limits, not guarantees of a reportable percentage: sample
floors still apply. D1 and D7 do not require a month. Today's cohort and later
cohorts each have their own clock.

Onboarding, license conversion and D1/D7/D30 retention include only claims that
your host explicitly classifies as **new**. Existing users and unknown origins
enter neither the numerator nor denominator. `new_installs_by_day` also excludes
the adoption wave, while **Installs** continues counting all observed claims.
License conversion still measures the cohort's current paid status, not an
observed trial-to-paid transition. License share and active counts continue to
include reporting existing users.

## Classify the installation when you initialize

Use the optional `installOrigin` initialization argument in an SDK version that
supports it. Read your app's existing first-launch or onboarding state **before**
updating that state:

- **existing**: the app installation predates Jelto. A saved first-launch date or
  completed-onboarding flag can establish this.
- **new**: the host positively knows this is the app installation's first launch.
  An incomplete onboarding flag by itself is not enough.
- **unknown**: the host cannot tell. This is the default when omitted.

Only this coarse classification is sent; do not send the date or elapsed age.
For an existing Swift installation, for example:

```swift
Jelto.initialize(key: "YOUR_PRODUCT_ID", app: "desktop", installOrigin: .existing)
```

Choose the value from the saved state for each installation; do not hardcode
`existing` for every future user or `new` for every SDK initialization. See your
SDK's guide for the corresponding argument.

The SDK freezes the value with its first claim. Retries and later launches keep
it even if your initialization argument changes. Claims from older SDKs remain
unknown, including already queued claims. Updating the SDK cannot repair those
historical cohorts. Resetting an SDK identity creates an unknown claim, not a
new app installation; do not reset identities, resend claims or backdate events.

**Rollout:** deploy the server's origin migration and readers before releasing
SDK-enabled host changes. Historical unknown claims are excluded by the new
cohort definitions, so historical cohort totals can decrease after that server
update. This is a methodology change, not a loss of users. If all your claims
have unknown origin, eligible cohorts remain empty until explicitly new
installations report; a month of waiting alone will not populate them.

See [Understand app usage](../guides/understand-app-usage.md) for the cards,
published-version setup and reporting rules.
