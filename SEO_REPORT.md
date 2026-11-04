# SEO & Lead Generation Report

## Round 2: canonical address, page speed and content

Branch: `seo/canonical-images-and-content`

This round fixes one critical indexing problem, removes most of the page weight from banners and the homepage video, and adds real content to the 26 thinnest service and industry pages.

### Fixes

| Priority | Problem found | Fix |
|---|---|---|
| Critical | Every page's canonical tag, `og:url` and structured data pointed to `https://datahubusa.com/...`, which redirects to `www`, while the sitemap used `www`. Google received conflicting signals on every page. | All of them now use `https://www.datahubusa.com`, including when `SITE_URL` in Vercel is still set to the bare domain. |
| High | Banners loaded full-size originals up to 15.9 MB (`governance.jpg` at 7.2 MB on 9 GRC pages). | Switched to the smaller versions already in the repo, typically 120–360 KB, on 25 templates. |
| High | The homepage video was 50 MB and autoplayed. | Re-encoded to 5 MB at the same 720p size and added a 128 KB poster image. The unused audio track was removed (the banner plays muted). |
| High | Service and industry pages had about 100 words each. | Added 115–173 words per page on 26 pages, in `data/page-content.json`. Pages now have roughly 210–350 words. |
| High | `/our-team` is an "Under Construction" page with 17 words, but it was indexed. | Set to noindex and removed from the sitemap until it has real bios. The menu link stays. |
| Medium | 100 images had no `width` and `height`, which can make the page jump while loading. | Added real dimensions. Logo rows use `width: auto` so their layout does not change. |
| Medium | Service pages had few contextual links to each other. | Added a "Related services" block with 4 links on each of the 26 pages. |
| Medium | Search engines had no explicit description of each service. | Added `Service` structured data to 18 solution and GRC pages, and GRC breadcrumbs now read Home > Solutions > GRC > page. |
| Low | Four homepage buttons all said "Our Capabilities". | They now name the service, e.g. "GRC Capabilities". |
| Low | No `llms.txt`. | Added one. It is optional and Google ignores it, so expect little direct effect. |

The sitemap now lists 37 URLs, with a `lastmod` date on every page whose content changed.

### Needs owner review before merging

The new copy in `data/page-content.json` explains each service and the regulations around it. It does not add clients, results or certifications, but it has not been reviewed by the business. Please check that it describes what DataHub actually offers, and have a compliance-minded reader check the regulatory statements. Edit the wording in that one file; no template changes are needed.

### Verified

- Crawled all 39 reachable pages locally: no broken links or missing images, one H1 per page, and valid structured data on the pages sampled.
- Canonical tags use `www` with `SITE_URL` unset and with it set to the bare domain.
- Checked images on 13 image-heavy pages: rendered proportions match their dimensions.
- Checked the new section at desktop and phone width, with no sideways scrolling, and confirmed the new video plays.

Not measured: Google PageSpeed scores, because the public API refused the request (daily quota exceeded). Run PageSpeed Insights after deploying.

### Still open

- **Search Console:** after deploying, resubmit the sitemap and check the Pages report for "Alternate page with proper canonical tag" and redirect errors. The canonical problem should clear over the following weeks.
- **`SITE_URL` in Vercel:** set it to `https://www.datahubusa.com` for consistency.
- **Google Analytics:** `GA_TRACKING_ID` is still not set on the live site, so organic leads are not being measured.
- **Chat button on phones:** it still covers the Contact Us button, and Jim is offline because its temporary address no longer resolves.
- **Our Team:** add real names, roles and bios, then remove the noindex. Named experts are one of the strongest trust signals available to this site.
- **Proof and fresh content:** add client results, and publish regularly. The newest blog post is from January 2024.
- **Animated GIFs:** several are still 0.5–2.3 MB each and should become video or WebP.
- **Heading order:** many pages jump from H2 to H4. This is an accessibility cleanup rather than a ranking issue.

## Round 1: metadata, structured data and contact paths

Branch: `seo/metadata-schema-and-lead-gen`

This pass improves how the site appears in Google and AI search, and makes it easier for visitors to contact DataHub. No page layouts, URLs, or business logic were rewritten. The changes are metadata, two new partials, and small additive CSS/JS.

## What was already good

- Every page has exactly one `<h1>`.
- Every `<img>` has alt text; most below-the-fold images are lazy-loaded.
- Canonical tags, `robots.txt`, and an XML sitemap already existed.

## SEO changes

### 1. Titles and meta descriptions (`data/seo.json`)
All 41 pages were rewritten. Many were generic ("IBM Power | DataHub") or too short to earn clicks (as low as 44 characters).

- Titles now lead with the service/keyword people search for (e.g. *"Data Security & Zero Trust Solutions | DataHub"*), roughly 45–63 characters.
- Descriptions are now 120–150 characters, describe the service, and end with a call to action ("Talk to a GRC expert today").
- The homepage title now targets *IT consulting, GRC & data security in Chicago*.
- The contact page description includes the phone number, so it can show directly in search results.

### 2. Structured data (JSON-LD), new `views/partials/seo-head.ejs`
Added to every page:

| Schema | Where | Why |
|---|---|---|
| `ProfessionalService` (organization) | All pages | Name, logo, address, phone, email, hours, service areas (US/UK), social profiles. Helps Google's knowledge panel and AI answers identify DataHub. |
| `WebSite` | All pages | Site name in search results. |
| `BreadcrumbList` | All indexable inner pages | Breadcrumb trail in search results (e.g. *Home › Solutions › Security*). |
| `BlogPosting` | 3 blog posts | Publish date and publisher for articles. |
| `ContactPage` | `/contact-2` | Marks the contact page. |

All JSON-LD blocks were parsed and checked on every route (0 errors).

### 3. Social sharing previews
Added `og:image`, `og:site_name`, `og:locale`, Twitter Card tags, and `article:published_time` on posts. Links shared on LinkedIn, X, Slack, or Teams now show an image card instead of plain text. `og:url` now uses the canonical URL.

### 4. Indexing hygiene
- **noindex** added to pages that shouldn't rank: the 404/500 pages, `/client-login`, `/form` (duplicate of the contact page), `/landing-page`, and the six thin partner stub pages (`/ibm`, `/aws-2`, …). They still pass link value (`noindex, follow`).
- **Sitemap** now lists only the 38 indexable pages and adds `<lastmod>` dates to blog posts.
- **robots.txt** now blocks `/api/`.
- **301 redirects** for old WordPress-style trailing-slash URLs (`/our-team/` → `/our-team`), so backlinks from the old site consolidate on one URL. Common guesses are also redirected: `/contact`, `/contact-us` → `/contact-2`; `/blog`, `/news` → `/news-blog`; `/about`, `/about-us` → `/our-mission`; `/healthcare` → `/healthcare-3`.
- Partner page names fixed: "Ibm", "Vm Ware", "Aws" became **IBM, VMware, AWS, Red Hat, Cisco, Google Cloud**.

### 5. Small performance and quality wins
- The Lordicon script is now `defer`, so it no longer blocks page rendering.
- Added `apple-touch-icon` and `theme-color`.
- **Mobile horizontal-scroll bug fixed.** The off-screen mobile menu made every page 750px wide on phones, so pages could be dragged sideways. One CSS line fixes it. Google's mobile usability checks flag this kind of problem.

## Lead generation changes ("make it easier to reach us")

| Change | Where | Effect |
|---|---|---|
| **"Talk to an Expert" button** | Top bar, every page (desktop) | Always-visible contact entry point. |
| **Contact CTA band** above the footer | Every page except the contact pages | Headline, "Contact Our Team" button and click-to-call. On service/industry pages it is tailored, e.g. *"Talk to a DataHub Security expert"*. |
| **Service pre-fill** | CTA band → contact form | The CTA links to `/contact-2?service=Security`, and the form's Subject is pre-filled ("Security inquiry"), so leads arrive already qualified. |
| **Mobile quick-contact bar** | Every page on phones | Sticky **Call / Email / Contact Us** bar. Before this, the phone number was hidden on mobile (the top bar is hidden under 768px). |
| **Friendlier contact form** | `/contact-2` | Copy invites people to describe their project, shows the phone number, and adds a subject hint. `autocomplete` attributes enable one-tap autofill on mobile. |
| **Get directions** link | Contact page + footer address | Opens Google Maps to the Chicago office. |
| **Consistent address (NAP)** | Contact page, `/form` page, schema | The office ZIP appeared as both **60654** and **60611**. Everything now uses `119 W. Hubbard, Suite 4E, Chicago, IL 60654`. Consistent name/address/phone is a local-SEO ranking signal. |
| **Lead tracking** | `public/js/main.js` | When `GA_TRACKING_ID` is set, these GA4 events fire: `generate_lead` (form submitted), `click_to_call`, `click_to_email`, `cta_click` (with location). Mark `generate_lead` as a key event in GA4 to measure conversions. |
| **Bug fix: last name was dropped** | `routes/api.js` | The `/form` page sends First + Last name, but the API only kept the first. Both are now combined. |

## Verification done

- The app was started locally and every route (41 pages + partner stubs + a 404) was crawled. Each returned the expected status, one robots tag, the expected title/description, a canonical URL, and valid JSON-LD.
- Redirects tested: trailing slash (with query string preserved), `/contact`, `/blog`, `/about` → 301 to the right page.
- Contact API tested with a first + last name submission.
- Checked visually in a browser at desktop and mobile (375px): top-bar button, CTA band, mobile contact bar, pre-filled subject, mobile menu still opens and covers the bar, no horizontal scroll.

## Please verify (business facts I could not confirm)

1. **ZIP code.** I standardized on **60654**. If 60611 is correct, change it in `views/partials/seo-head.ejs`, `views/partials/footer.ejs`, `views/pages/contact.ejs`, and `views/pages/form.ejs`.
2. **Hours** in the schema (Mon–Fri, 7:00–21:00) come from the contact page's "7 AM – 9 PM CST".
3. **Twitter/X handle** `@databorgs` was taken from the existing links. Confirm it is still DataHub's account.

## Recommended next steps (not done: needs assets, credentials, or larger changes)

1. **Make sure leads actually arrive (high priority).** On Vercel, the contact form saves to `/tmp`, which is temporary, and it only emails if `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are set. Without those environment variables, form submissions are effectively lost. Set SMTP in Vercel (and `CONTACT_EMAIL`), then send a test message.
2. **Set `GA_TRACKING_ID`** in Vercel so the new lead events are recorded.
3. **Compress the homepage hero video.** `DataHub.mp4` is **50 MB** and autoplays on every homepage visit. It is the biggest drag on load speed and Core Web Vitals (LCP), especially on mobile. Re-encoding to ~720p H.264/WebM at 2–5 MB and adding a `poster` image would make the biggest speed difference.
4. **Convert the large GIFs** on the homepage (0.5–1.3 MB each) to MP4/WebM or WebP.
5. **Submit the sitemap** (`https://datahubusa.com/sitemap.xml`) in Google Search Console and Bing Webmaster Tools, and verify `SITE_URL` is set in production.
6. **Claim/update the Google Business Profile** for the Chicago office with the same name, address, and phone as the site.
7. **Content depth.** The GRC sub-pages and partner pages are short. Adding 300–600 words of specifics (approach, deliverables, frameworks such as SOC 2/ISO 27001/NIST, a short case example) would help them rank and get cited by AI answers.
8. **Fix misspelled URLs later** (`/operation-risk-managment`, `/business-continuity-managment`, `/tellcumacation`, `/healthcare-3`, `/contact-2`). They were left unchanged to avoid breaking existing links. If renamed, add 301 redirects in `middleware/seo.js` (the `legacyRedirects` map).
9. **Add testimonials or client results.** Client logos are shown, but named outcomes or quotes would build trust and conversions.

## Files changed

- `data/seo.json`: titles, descriptions, noindex flags
- `views/partials/seo-head.ejs` (new): robots, Open Graph, Twitter Card, JSON-LD
- `views/partials/contact-cta.ejs` (new): CTA band + mobile contact bar
- `views/layouts/main.ejs`: include the new partials, icons, deferred script
- `views/partials/header.ejs`, `views/partials/footer.ejs`: top-bar CTA, tel format, map link
- `views/pages/contact.ejs`, `views/pages/form.ejs`: copy, autocomplete, consistent address
- `middleware/seo.js`: redirects, robots.txt, sitemap
- `routes/pages.js`: partner names + noindex
- `routes/api.js`: keep last name
- `server.js`: noindex on error pages
- `public/css/style.css`: styles for the new elements, mobile overflow fix
- `public/js/main.js`: service pre-fill, GA4 lead events
