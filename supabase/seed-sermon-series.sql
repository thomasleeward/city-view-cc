-- Seed sermon archive migrated from https://cityviewcc.com/watch on 2026-05-24.
-- Run after supabase/schema.sql if you want the Supabase database populated.
-- This avoids duplicates by checking for an existing row with the same name and start_date.

insert into public.sermon_series (
  name,
  date_label,
  start_date,
  end_date,
  image_url,
  youtube_playlist_url,
  sort_order,
  is_published
)
select
  seed.name,
  seed.date_label,
  seed.start_date,
  seed.end_date,
  seed.image_url,
  seed.youtube_playlist_url,
  seed.sort_order,
  true
from (
  values
    ('Bent Out Of Shape', '5/3/2026-Present', '2026-05-03'::date, null, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-05-03-bent-out-of-shape.png', 'https://www.youtube.com/playlist?list=PLTe-INsuucft1feUrzbyWuOYMe-d8xi9n', 0),
    ('Bent Out Of Shape', '4/26/2026', '2026-04-26'::date, null, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-04-26-bent-out-of-shape.png', 'https://www.youtube.com/playlist?list=PLTe-INsuucftTE4aDabXTAWN_UhvdIQMN', 1),
    ('Gradually Then Suddenly', '4/5/2026-4/19/2026', '2026-04-05'::date, '2026-04-19'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-04-05-gradually-then-suddenly.png', 'https://www.youtube.com/playlist?list=PLTe-INsuucftTE4aDabXTAWN_UhvdIQMN', 2),
    ('Road to Easter', '3/29/2026', '2026-03-29'::date, null, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-03-29-road-to-easter.jpg', 'https://youtube.com/live/o2jFdCxGpdc?feature=share', 3),
    ('Red Flags', '3/1/2026-3/22/2026', '2026-03-01'::date, '2026-03-22'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-03-01-red-flags.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfudX_mvb1DWA58oknRkBV6G', 4),
    ('Altars And Ashes', '2/1/2026-2/22/2026', '2026-02-01'::date, '2026-02-22'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-02-01-altars-and-ashes.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfuw401sSSJ3b5uM9qLbFw9y', 5),
    ('First Things First', '1/4/2026-1/25/2026', '2026-01-04'::date, '2026-01-25'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2026-01-04-first-things-first.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfuw401sSSJ3b5uM9qLbFw9y', 6),
    ('Christmas 2025', '12/7/2025-12/24/25', '2025-12-07'::date, '2025-12-24'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-12-07-christmas-2025.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfsMjXyGsMa-xSfj8yK1A8lT', 7),
    ('Be Generous', '11/2/2025-11/30/2025', '2025-11-02'::date, '2025-11-30'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-11-02-be-generous.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfu7VF0bw3NMuyAOHqMSqHuv', 8),
    ('When Necessary', '9/28/2025-10/26/2025', '2025-09-28'::date, '2025-10-26'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-09-28-when-necessary.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvTDdwqUndy8gzZqBDbW9GU', 9),
    ('At The Movies', '9/7/2025-9/21/2025', '2025-09-07'::date, '2025-09-21'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-09-07-at-the-movies.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfu7o76ldxuWdWcmz5OhfJap', 10),
    ('Hall of Flaw', '8/10/2025-8/31/2025', '2025-08-10'::date, '2025-08-31'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-08-10-hall-of-flaw.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftzFHfeQ5AHr-flkWXS1QNW', 11),
    ('21 Days of Prayer', '8/3/2025', '2025-08-03'::date, null, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-08-03-21-days-of-prayer.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvy4xChKI0WNuRWtzneKWCT', 12),
    ('Hall of Flaw', '6/1/2025-7/27/2025', '2025-06-01'::date, '2025-07-27'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-06-01-hall-of-flaw.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftgtbOnGocGoYnbJJy_ANgP', 13),
    ('Yes, God', '4/20/2025-5/25/2025', '2025-04-20'::date, '2025-05-25'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-04-20-yes-god.png', 'https://www.youtube.com/playlist?list=PLTe-INsuucfurECVhxKASY4j54ldEu_MG', 14),
    ('You Don''t Complete Me', '3/30/2025-4/13/2025', '2025-03-30'::date, '2025-04-13'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-03-30-you-don-t-complete-me.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfsRtP-bmHrxhZwK6lF1BtaN', 15),
    ('You Don''t Complete Me', '3/2/2025-3/23/2025', '2025-03-02'::date, '2025-03-23'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-03-02-you-don-t-complete-me.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftYKI1_mDBTK-lPK_Nc8Fvf', 16),
    ('Same Old Me', '2/2/2025-2/23/2025', '2025-02-02'::date, '2025-02-23'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-02-02-same-old-me.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvZriCTl_TL44p7YPTGsG6O', 17),
    ('Same Old Me', '1/5/2025-1/26/2025', '2025-01-05'::date, '2025-01-26'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2025-01-05-same-old-me.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfs37I8q4crVMge25gGV4-V5', 18),
    ('Christmas Eve 2024', '12/24/2024', '2024-12-24'::date, null, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-12-24-christmas-eve-2024.jpg', 'https://youtube.com/live/sjR-in6aqIE', 19),
    ('Hope For The Holidays', '12/1/2024-12/22/2024', '2024-12-01'::date, '2024-12-22'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-12-01-hope-for-the-holidays.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfunB0_SjQKQmQNJ2jGBQMFR', 20),
    ('Moses: Leadership in the Making', '10/20/2024-11/24/2024', '2024-10-20'::date, '2024-11-24'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-10-20-moses-leadership-in-the-making.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftThFpWQO2LETe8d_CxK2PU', 21),
    ('Donkeys, Elephants, & Jesus', '10/6/2024-10/13/2024', '2024-10-06'::date, '2024-10-13'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-10-06-donkeys-elephants-and-jesus.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftSzmpwiFqY8zl2r0ult7Ou', 22),
    ('Made For More', '9/1/2024-9/29/2024', '2024-09-01'::date, '2024-09-29'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-09-01-made-for-more.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvfSLlFtyU2E7CDdLPnxce0', 23),
    ('Crossing Over', '8/25/2024', '2024-08-25'::date, null, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-08-25-crossing-over.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfu8TnLtHLFN_ZcUCyw6uRVJ', 24),
    ('Summer Stories', '7/7/2024-8/18/2024', '2024-07-07'::date, '2024-08-18'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-07-07-summer-stories.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfv_62lktErhEeHmBXSBJ2-E', 25),
    ('Family Feels', '6/2/2024-6-30-2024', '2024-06-02'::date, '2024-06-30'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-06-02-family-feels.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfuTUSt0Qac0WOQsbdC2MLDP', 26),
    ('Divine Disruptions', '5/5/2024-5/26/2024', '2024-05-05'::date, '2024-05-26'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-05-05-divine-disruptions.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfs8qwN7sTFirbR_cPV901Kh', 27),
    ('Quotation Marks', '3/31/2024-4/28/2024', '2024-03-31'::date, '2024-04-28'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-03-31-quotation-marks.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfv2WVuckP2_p-lt-zEV_B7i', 28),
    ('Truth to Power', '2/25/2024-3/24/2024', '2024-02-25'::date, '2024-03-24'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-02-25-truth-to-power.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvDr8BGD6E6yVwOpPTc79vG', 29),
    ('Airplane Mode', '2/4/2024-2/18/2024', '2024-02-04'::date, '2024-02-18'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-02-04-airplane-mode.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfutht4OF6sBPJhdJ15Q6mJ7', 30),
    ('Airplane Mode', '1/7/2024-1/28/2024', '2024-01-07'::date, '2024-01-28'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2024-01-07-airplane-mode.png', 'https://www.youtube.com/playlist?list=PLTe-INsuucftFaOnnUNpdrg_ANR1Ujaf6', 31),
    ('Wishlist for Christmas', '11/26/2023-12/24/2023', '2023-11-26'::date, '2023-12-24'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-11-26-wishlist-for-christmas.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfsKQVepmooxLe6gBqnuaza9', 32),
    ('To Timothy', '11/12/2023-11/19/2023', '2023-11-12'::date, '2023-11-19'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-11-12-to-timothy.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvEBsNjvzFAJOeIoHiqL23L', 33),
    ('Elisha: Answer the Call', '10/1/2023-11/5/2023', '2023-10-01'::date, '2023-11-05'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-10-01-elisha-answer-the-call.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfuhfVwKddfPzZIZqV9j0FEB', 34),
    ('Summer on the Mount', '7/23/2023 - 8/27/2023', '2023-07-23'::date, '2023-08-27'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-07-23-summer-on-the-mount.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvXKsDO3Qxi-gqQZvhwnwwt', 35),
    ('Elisha: Answer the Call', '6/4/2023 - 7/2/2023', '2023-06-04'::date, '2023-07-02'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-06-04-elisha-answer-the-call.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftGL78VETHwD4LRjsL2LH38', 36),
    ('Masterpiece In Progress', '5/14/2023 - 5/28/2023', '2023-05-14'::date, '2023-05-28'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-05-14-masterpiece-in-progress.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvHK1HuCJHadqKlCBtW6bs-', 37),
    ('God and the Underdogs', '4/9/2023 - 5/7/2023', '2023-04-09'::date, '2023-05-07'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-04-09-god-and-the-underdogs.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfs7WN9QVWlJr-FqsV6RePfU', 38),
    ('Tighten the Knot', '3/12/2023 - 4/2/2023', '2023-03-12'::date, '2023-04-02'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-03-12-tighten-the-knot.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfu4JO6bT0EWn5PP9Tr6jNDk', 39),
    ('Above & Beyond', '2/5/2023 - 2/19/2023', '2023-02-05'::date, '2023-02-19'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-02-05-above-and-beyond.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvxpbbIRES8rfo5OVkHAc7X', 40),
    ('Stop The Scroll', '1/8/2023 - 1/29/2023', '2023-01-08'::date, '2023-01-29'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2023-01-08-stop-the-scroll.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfsffIbWT2sYRpXPzWGtSyHV', 41),
    ('The Coming King', '12/4/2022 - 12/24/2022', '2022-12-04'::date, '2022-12-24'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-12-04-the-coming-king.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfuzwe90fejlcNnqtve9kMz0', 42),
    ('Waiting for When', '10/16/2022 - 11/27/2022', '2022-10-16'::date, '2022-11-27'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-10-16-waiting-for-when.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfshzNesOjHKdMczDKKB-LmM', 43),
    ('Getting Over It', '9/18/2022 - 10/9/2022', '2022-09-18'::date, '2022-10-09'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-09-18-getting-over-it.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvevkr8a4NeST4hpxU6ZRrp', 44),
    ('What''s In It For Me?', '8/14/2022 - 9/11/2022', '2022-08-14'::date, '2022-09-11'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-08-14-what-s-in-it-for-me.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfsRlt241i4pN4Y6d8NzYPXs', 45),
    ('Summer Love', '7/3/2022 - 7/31/2022', '2022-07-03'::date, '2022-07-31'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-07-03-summer-love.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfueXL90IGtvfeMtH_V-2USd', 46),
    ('Fool-Proofing Your Life', '4/24/2022 - 6/19/2022', '2022-04-24'::date, '2022-06-19'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-04-24-fool-proofing-your-life.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfstujPs_bp8LOyrCKPx31Se', 47),
    ('The Runaway', '3/6/2022 - 4/10/2022', '2022-03-06'::date, '2022-04-10'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-03-06-the-runaway.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfvQFkH6RvR70pZ3mclBAGHg', 48),
    ('Our House', '2/6/2022 - 2/27/2022', '2022-02-06'::date, '2022-02-27'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-02-06-our-house.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucfupmY7YBox94aynDbfCjnEk', 49),
    ('I''ll Do It Tomorrow', '1/9/2022 - 1/30/2022', '2022-01-09'::date, '2022-01-30'::date, 'https://rocuyegaazmzaneabnuu.supabase.co/storage/v1/object/public/sermon-images/series/2022-01-09-i-ll-do-it-tomorrow.jpg', 'https://www.youtube.com/playlist?list=PLTe-INsuucftYlppHcT-c40P-SYrjFvoN', 50)
) as seed (name, date_label, start_date, end_date, image_url, youtube_playlist_url, sort_order)
where not exists (
  select 1
  from public.sermon_series existing
  where existing.name = seed.name
    and existing.start_date = seed.start_date
);
