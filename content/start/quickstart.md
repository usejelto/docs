---
title: "Create your first product"
group: start
slug: start/quickstart
summary: "Choose a product, register its website or app, and connect the first data source."
---

# Create your first product

A product is the place where you view analytics for one business or application. It can contain a website, a desktop app, or both. Website visitors and app installs remain separate audiences.

## Set up the product

You need access to the website or app you want to measure: your own project's code or site-builder settings. If you don't have a Jelto account yet, [create one](https://app.jelto.io/login).

1. Open **All products → New product**; an account with no products opens **New product** directly. The initial form is **Add a website**.
2. For a website, enter **Website URL** and **Website name**, check **Reporting timezone**, then choose **Create website**. The URL accepts a full address or hostname; use the main published host. Jelto also registers the matching `www` or non-`www` hostname: entering `example.com` or `www.example.com` allows both. No extra hostname is added for other subdomains (such as `blog.example.com`), IP addresses or localhost.
3. If you only have a desktop app, choose **I only have an app**, enter the app product name, check its reporting timezone and choose **Create an app product**. You can add a website later.
4. Website creation opens the guided **Install tracking** step, followed by optional **First goal** and revenue setup. Enable **This website also has an app** to include **Set up SDK**. You can finish later and return through **Finish setup** in the product list.
5. In **Settings → Installation → Allowed hostnames**, register any other hosts that will send traffic, such as `docs.example.com` or `shop.example.com`. If an existing website lists only one of `example.com` and `www.example.com` and your site serves both, add the other one. For a desktop app, open **Settings → Installation → Apps**, choose its framework and every operating system you release, then initialize the SDK as shown there. App-only creation opens that Apps page directly.
6. Use **Settings → Overview** to review the product name and reporting timezone before comparing dates.

## Connect the first source

- [Install website tracking](website.md): copy the product's script into your site.
- [Connect a desktop app](apps.md): choose the SDK for your app.
- [Connect revenue](../payments/connect.md): connect the provider after deciding which payments belong to this product.

## Check the result

Follow [Verify website tracking](verify.md) or the [per-app activity checks](apps.md#verify-app-activity). Then [read your dashboard](../guides/read-your-dashboard.md). Until the first pageview arrives, its website section reads **No web data yet**, with links to **Add the snippet** and **Check Allowed hostnames**. Empty cards before any data arrives do not mean that you need to create another product.

## Trial and development products

The 14-day trial includes two products, which share the trial’s usage allowances. Use the second for development: name it something like **My app — Development** and put its product ID (a public value such as `prd_8f3kq2m9x1`) in development builds so test events stay out of production reports. Starter includes one product after the trial. Product deletion has a seven-day cancellation window, so before choosing Starter, delete the development product and allow at least seven days for deletion to finish, or choose Growth to keep both.

## Next steps

[Create a goal](../goals/create-goal.md) for an action such as signup, then [build a funnel](../web/funnels.md) to see how website visits reach it. Invite collaborators through [Team](../manage/team.md).
