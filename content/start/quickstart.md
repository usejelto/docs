---
title: "Create your first product"
group: start
slug: start/quickstart
summary: "Choose a product, register its website or app, and connect the first data source."
---

# Create your first product

A product is the place where you view analytics for one business or application. It can contain a website, a desktop app, or both. Website visitors and app installs remain separate audiences.

## Before you start

Have access to your Jelto account and to the website or app you want to measure. You only need your own project's code or site-builder settings. The 14-day trial includes two products: use one for production and name the other something like **My app — Development**. Keep its product key in development builds so test events stay out of production reports. Both products share the trial’s usage allowances. Starter includes one product after the trial; remove the development product and wait for deletion to finish before choosing Starter, or choose Growth to keep both.

## Set up the product

1. Open **All products → New product**. The initial form is **Add a website**.
2. For a website, enter **Website URL** and **Website name**, check **Reporting timezone**, then choose **Create website**. The URL accepts a full address or hostname; use the main published host.
3. If you only have a desktop app, choose **I only have an app**, enter the app product name, check its reporting timezone and choose **Create an app product**. You can add a website later.
4. Website creation opens the guided **Install tracking** step, followed by optional **First goal** and revenue setup. Enable **This website also has an app** to include **Set up SDK**. You can finish later and return through **Finish setup** in the product list.
5. In **Settings → Installation → Allowed hostnames**, register additional hosts that will send traffic, including `www` or a documentation subdomain when used. For a desktop app, open **Settings → Installation → Apps**, add its platform and app slug, and use that slug when initializing the SDK. App-only creation opens that Apps page directly.
6. Use **Settings → Overview** to review the product name and reporting timezone before comparing dates.

## Connect the first source

- [Install website tracking](website.md): copy the product's script into your site.
- [Connect a desktop app](apps.md): choose the SDK for your app.
- [Connect revenue](../payments/connect.md): connect the provider after deciding which payments belong to this product.

## Check the result

Follow [Verify website tracking](verify.md) or the [per-app activity checks](apps.md#verify-app-activity). Then [read your dashboard](../guides/read-your-dashboard.md). Empty cards before any data arrives do not mean that you need to create another product.

## Next steps

[Create a goal](../goals/create-goal.md) for an action such as signup, then [build a funnel](../web/funnels.md) to see how website visits reach it. Invite collaborators through [Team](../manage/team.md).

Product deletion has a seven-day cancellation window. Allow at least seven days for the development product to be deleted before switching to a one-product plan.
