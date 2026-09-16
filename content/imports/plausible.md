---
title: "Import Plausible history"
group: integrations
slug: imports/plausible
summary: "Preview a site export and bring supported historical aggregates into Jelto."
---

# Import Plausible history

Bring existing reporting history with you when moving from Plausible. Jelto imports supported daily aggregates, not raw visitor journeys.

## Plan the move before collecting traffic

Jelto currently accepts Plausible site-settings exports. Exports from other analytics tools, historical app activity and customer records cannot be imported through this flow. Keep those reports in the original tool for historical reference.

Match your Jelto product's reporting timezone to the export before collecting data. Daily aggregates cannot be moved into a different timezone. Only dates within your retention period and strictly before the first native Jelto day are eligible. Even one development or test visit received by your production product can establish that cutoff. Use a separate product for testing, then review the import preview against your intended production start. Once reserved by an import, the cutoff is retained for later uploads.

Keep the old tracker during verification and compare a completed day using the same timezone and comparable metrics. Differences in bot filtering, identity and reporting definitions can produce different counts; an import does not make those definitions identical.

## Prepare the export

In Plausible, export the site's data from its site settings. Use the ZIP containing the CSV reports, rather than a single dashboard chart export. Note the timezone used by those daily reports and when native Jelto collection started.

## Preview and import

1. Open **Settings → Privacy & data → Imports** in the intended Jelto product.
2. Choose the Plausible ZIP and confirm that its reporting timezone matches the product timezone shown, then upload it for **Preview**. If it differs, correct the product timezone before importing.
3. Review dates, report families, row counts, skipped rows and warnings. Check the proposed cutover against the start of Jelto collection to avoid overlapping native and imported reporting.
4. Start the import only after that preview matches your intended history.
5. Wait for processing to complete. Uploading alone does not activate the history.

## Verify the result

Select a known historical day and compare a supported metric with the export. Read the dashboard's imported-coverage notes. Keep the source ZIP until you have verified the result.

Imported counts cannot reconstruct ordered website funnels, raw sessions, custom-goal identities or visitor-level revenue attribution. Do not expect those reports to acquire a historical journey merely because a visitor total was imported.

## Recover or remove

Use **Retry** on a failed job after addressing its reported issue. **Cancel** stops processing; **Remove** deletes that import's contributions. Check the selected job and confirmation before removing history.

If the ZIP is rejected, confirm that it came from the site's export settings and contains the supported CSV reports. If totals look duplicated, review cutover and date coverage before attempting another upload. Jelto does not ask for your Plausible account password.
