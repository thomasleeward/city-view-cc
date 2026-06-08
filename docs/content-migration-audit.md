# City View Current Website Migration Audit

Sources inspected on May 24, 2026:

- Home: https://cityviewcc.com/
- About Us: https://cityviewcc.com/about-us
- Get Connected: https://cityviewcc.com/get-connected
- Events: https://cityviewcc.com/events
- Giving: https://app.securegive.com/cityviewcc
- Watch: https://cityviewcc.com/watch

## Current Sitemap

- Home
- About Us
- Get Connected
- Events
- Giving, external SecureGive
- Watch, renamed in the rebuild to Sermon Archive with `/watch` redirecting

## Content To Migrate

### Home

- Main headline: "Sundays at 8:30AM & 10:30AM"
- Subheadline: "We want Sunday to influence your Monday!"
- Welcome copy about God creating each person with purpose
- Service details: Sundays at 8:30AM + 10:30AM, 9320 Willowgrove Ave, Santee, CA 92071
- "#ForSantee" visitor/connection section
- City Kids copy
- Student Meetup copy
- Community / connect groups copy
- Current sermon series section
- Live online links to Facebook and YouTube
- Contact form and social links

### About Us

- Our Story section
- Vision and Values graphic/content
- Team section:
  - Danny & Lauren Henderson, Lead Pastors, danny@cityviewcc.com
  - Lauren Henderson, Volunteer Director, lauren@cityview.cc
  - Groups, hello@cityviewcc.com
  - Danny Liera, Worship Pastor, worship@cityviewcc.com
  - Julie Lopez, Children's Ministry Director, kids@cityviewcc.com
  - Dustin & Jasmin Horning, Student Ministry Directors, students@cityviewcc.com
  - Mary Henderson, Outreach Director, hello@cityviewcc.com
  - Church Office, hello@cityviewcc.com
- Full Statement of Faith

### Get Connected

- Kids & Students intro
- City Kids service copy
- Student Meetup service copy
- Connect Groups
- Connect Class
- Baptism
- Following Jesus and gospel explanation
- Read the Bible resource
- Join a Team and team list
- Prayer request form
- Contact form

### Sermon Archive

Newest items found:

- Bent Out Of Shape, 5/3/2026-Present
- Bent Out Of Shape, 4/26/2026
- Gradually Then Suddenly, 4/5/2026-4/19/2026
- Road to Easter, 3/29/2026
- Red Flags, 3/1/2026-3/22/2026
- Altars And Ashes, 2/1/2026-2/22/2026
- First Things First, 1/4/2026-1/25/2026
- Christmas 2025, 12/7/2025-12/24/25
- Be Generous, 11/2/2025-11/30/2025
- When Necessary, 9/28/2025-10/26/2025

The rebuild includes all 51 sermon cards found on the current Watch page as fallback content. To populate Supabase directly, run `supabase/seed-sermon-series.sql` after `supabase/schema.sql`.

## External Links

- Giving: https://app.securegive.com/cityviewcc
- Facebook: https://www.facebook.com/cityviewcc/
- Instagram: https://www.instagram.com/cityview_cc/
- YouTube: https://www.youtube.com/channel/UC_laGKyf5lPLF-wOklhGLNw
- Bible plan: https://www.bible.com/reading-plans/1808-whats-next

## Image Migration Notes

Most reused site and sermon images have been migrated from LeadConnector/FileSafe into Supabase Storage. The old homepage hero fallback image intentionally still references the original remote URL until final hero imagery is chosen.

- `hero-images`
- `sermon-images`
- `site-images`

## TODO

- Confirm final Events / Church Center URL.
- Confirm final Giving provider URL if replacing SecureGive.
- Replace contact and prayer forms with Planning Center form URLs.
- Copy full Statement of Faith from current About Us page.
