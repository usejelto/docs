---
title: "Manage collection and data"
group: manage
slug: manage/privacy-and-data
summary: "Review collection choices, export data and understand deletion controls."
---

# Manage collection and data

Use product settings to control what your site collects and how its data is managed. Keep collection preferences, report filters and deletion as separate decisions.

## Review collection

Check **Settings → Traffic & usage** for website pause and traffic exclusions. Check **Installation** for the script and its cookie/memory choices. [Cookies and domains](../analytics/cookies-and-domains.md) explains their reporting effects.

Avoid names, emails, IP addresses and personal identifiers in URLs, event names and custom properties. Use aggregate labels such as a plan or feature name. Do not introduce a shared website/app identity.

## Export and import

As an Owner, open **Settings → Privacy & data** and use its export controls for the intended product and scope. Keep exported files private. [Plausible imports](../imports/plausible.md) appear in the Imports section and can be managed separately from native collection.

Choose **Produce a record** for a completed CSV with a row count, byte count and
SHA-256 checksum. When it is ready, **Download the record** uses your current Owner
session. Stored files expire **seven days after the job is created**; polling or
downloading does not restart that clock. Existing jobs use their original creation
time, so older files may already be expired when this policy is introduced.

Expired links stop working immediately. Scheduled maintenance removes the stored
file and record, retrying failures. Produce a new record if you need another copy.
Keep any downloaded files private and manage their retention on your own devices;
Jelto cannot delete copies you have already downloaded or shared.

## Delete data

Choose the specific dataset or product action in Privacy & data and read its confirmation before proceeding. Check what will be removed, whether collection continues and whether the action can be undone. A product deletion is broader than clearing a filter or removing one imported history job.

Erasing one installation also revokes and removes its installation-specific exports
and all product-wide exports, including jobs already in progress. Other installations’
specific exports remain available until their own expiry. You can produce fresh
exports from remaining data once erasure completes; requests during an open erasure
must be retried later. File-removal failures keep the erasure open for retry.

Product/account deletion removes all their stored exports after the cancellation
window. Cancelling the scheduled deletion before it starts preserves unexpired
exports. Restarting Jelto or cancelling a subscription does not extend file retention.

App-data requests can use the install ID available from the relevant SDK. It identifies that app installation, not a website visitor. An SDK's local `disable` or `reset` call is not a substitute for a server-side historical data request.

Retention follows the account's plan and lifecycle. Required financial usage records may remain after analytics deletion. See [account usage](usage.md) and contact the Jelto team when the available controls do not cover the requested scope.
