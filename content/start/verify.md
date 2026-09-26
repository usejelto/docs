---
title: "Verify website tracking"
group: start
slug: start/verify
summary: "Check the published hostname and confirm a new pageview reaches Jelto."
---

# Verify website tracking

Verify collection using a real visit to the published site. Loading the script file and receiving an event are separate checks.

## Check your installation

1. Publish the script and open **Settings → Installation** in Jelto.
2. Under **2. Check your installation**, select the correct **Website to check**. A visit to `www.example.com` does not verify a different hostname.
3. Choose **Open website** and view a page in a normal browser tab. If your site requires an analytics consent choice, make that choice before testing.
4. Return to Jelto and choose **Check traffic**. Read the reported status and **Connection details**.


[![Wide installation check with badge 2 pointing to Website to check and badge 3 outlining Open website and Check traffic. The status reads Waiting for traffic.](../images/14-installation-check.png)](../images/14-installation-check.png)

*Choose the published hostname, open your website, then check for traffic. This demo is still waiting for a pageview.*

## What success means

A recent pageview from the selected hostname confirms collection for that page. Open a second page through your site's normal navigation and confirm it also appears in the dashboard's Pages card. Choose a date range that includes today and remove filters while checking.

## Still waiting for traffic

- Check the live site's HTML for your product ID (`prd_8f3kq2m9x1`) and the script URL.
- Confirm the script loads and the collection request is allowed by the site's CSP.
- Try a browser without a blocker affecting the tracking host.
- While the check is waiting, **Settings → Installation** and guided setup tell you if Jelto is receiving pageviews from a hostname that isn't on the website's **Allowed hostnames** list. Follow the link to **Allowed hostnames** and add that hostname if it belongs to this website.
- Register the hostname actually shown in the address bar. Redirects may change it. A newly created website already allows both `example.com` and `www.example.com`, but another subdomain, such as `blog.example.com`, needs its own entry. In guided setup, choose **Add hostname** beside the installation check; existing hostnames are kept, and the new hostname is selected for its own check.
- Localhost, `file:` pages, automation and `?jelto_ignore=1` are excluded by default. Use the explicit [local testing option](../web/configuration.md#local-testing) for localhost; automated visits are not a substitute for this check.

See [No data arriving](../troubleshooting/no-data.md) for a focused checklist.
