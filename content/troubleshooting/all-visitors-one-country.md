---
title: "All visitors appear in one country"
group: troubleshooting
slug: troubleshooting/all-visitors-one-country
summary: "Check filters and collection coverage before treating geography as audience truth."
---

# All visitors appear in one country

A country breakdown describes the observed traffic for the selected dates and filters. A narrow campaign or small sample can legitimately come from one country.

## Check the report

1. Clear source, country and other filters, and select a broader date range.
2. Compare the total and the country card's measurement state. Unavailable geography is not a measured country.
3. Confirm whether you are viewing ordinary website traffic, imported history or another data source.
4. Check whether the installed script and endpoint came from the current Installation settings. An unsupported intermediary in the collection route can affect geographic evidence.

## If it still looks wrong

If these checks do not resolve the issue, contact the Jelto team with the product, affected date range, tracking hostname and status shown in the dashboard. Do not include API keys or other credentials.

Do not start storing visitor IP addresses to investigate a report. A custom tracking domain should use the [managed setup](../integrations/tracking-domain.md), with a successful DNS/TLS check and actual traffic verification.
