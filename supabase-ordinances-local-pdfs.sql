-- ============================================================
-- CITY OF PIEDMONT — Move the three ordinances off the old
-- WordPress site and onto piedmontcity.org.
--
-- Run once in the Supabase SQL editor (Dashboard > SQL Editor)
-- AFTER deploying the build that ships these PDFs:
--     public/documents/ordinance-636-short-term-rentals.pdf
--     public/documents/ordinance-639-prohibiting-thc-products.pdf
--     public/documents/ordinance-640-brown-bagging-alcoholic-beverages.pdf
--
-- What it does:
--   1. Repoints the three public_notices rows at the local PDFs,
--      so the Public Notices page no longer depends on the old
--      wp-content URLs.
--   2. Writes the SHA-256 of each newly hosted file.
--   3. If that fingerprint differs from what was anchored during
--      the original backfill, the row is flipped back to
--      'pending' so the sweep re-anchors it. This keeps the
--      "Filed in the permanent record" badge honest: the
--      fingerprint shown always matches the file a resident
--      actually downloads.
--
-- After running this, re-anchor from the project root:
--     npm run anchor
-- ============================================================

-- ---------- 640: Brown bagging ----------
update public.public_notices
set file_url  = 'https://www.piedmontcity.org/documents/ordinance-640-brown-bagging-alcoholic-beverages.pdf',
    file_path = 'documents/ordinance-640-brown-bagging-alcoholic-beverages.pdf',
    anchor_status = case
      when sha256 is distinct from '7799b69eb4eac8e757e1b71e1c6baf060315c73d6594749413dc0a7efdf9ac4b'
      then 'pending' else anchor_status end,
    sha256 = '7799b69eb4eac8e757e1b71e1c6baf060315c73d6594749413dc0a7efdf9ac4b'
where title ilike '%640%';

-- ---------- 639: THC products ----------
update public.public_notices
set file_url  = 'https://www.piedmontcity.org/documents/ordinance-639-prohibiting-thc-products.pdf',
    file_path = 'documents/ordinance-639-prohibiting-thc-products.pdf',
    anchor_status = case
      when sha256 is distinct from '1f24a35c2df196d6e1e65d2cfef16ba54d79632bfad1f1fe5a4ee5a4252c4d09'
      then 'pending' else anchor_status end,
    sha256 = '1f24a35c2df196d6e1e65d2cfef16ba54d79632bfad1f1fe5a4ee5a4252c4d09'
where title ilike '%639%';

-- ---------- 636: Short-term rentals ----------
update public.public_notices
set file_url  = 'https://www.piedmontcity.org/documents/ordinance-636-short-term-rentals.pdf',
    file_path = 'documents/ordinance-636-short-term-rentals.pdf',
    anchor_status = case
      when sha256 is distinct from 'c94597067808d0c9ade16bb0c5ab55300374fa2ae5e872829030fd5b3351262b'
      then 'pending' else anchor_status end,
    sha256 = 'c94597067808d0c9ade16bb0c5ab55300374fa2ae5e872829030fd5b3351262b'
where title ilike '%636%';

-- ---------- check the result ----------
select title, posted_date, file_url, sha256, anchor_status
from public.public_notices
where title ilike '%ordinance%'
order by posted_date desc;
