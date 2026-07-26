# 03_lessons.md - Lessons Index

Keep this file short. Add only reusable lessons that change future decisions.

## Current Lessons

1. Verify `icon.png` after scaffold. Some favicon downloads return HTML/SVG instead of PNG.
2. `regexp` should match detail URLs only and should be strict enough to avoid false matches.
3. `page.js` is required. If no TOC pagination exists, return `[url]`.
4. Prefer stable API endpoints over brittle HTML selectors.
5. Use `fetch()` before `Engine.newBrowser()` unless JS rendering or protection requires a browser.
6. For AJAX/POST endpoints, copy required headers, body format, and cookies from discovery.
7. Sort chapters when API order is unstable.
8. Convert `.text()`, `.attr()`, `.html()` to JS strings with `+ ""`.
9. Avoid generic selectors unless verified on the real page.
10. Avoid `tagName()`, `is()`, and `tag()` in VBook scripts unless tested.

## Hard Site Notes

Detailed hard-site strategies live in `03_HARD_SITES.md`.

## Add New Lessons In This Format

```md
## Short Title

Problem: one sentence.

Signal: how to detect it.

Fix: concrete rule or code pattern.
```


---

## guanshuya — m.guanshuya.net TOC pagination via `_N` suffix + select dropdown\n\n**Problem:** Mục lục phân trang dạng `/html/ID/ID_N/` (e.g. `/html/161/161429_2/`) và cơ chế chọn trang qua `<select id=\"indexselect\">` thay vì phân trang thông thường. TOC chứa lẫn link điều hướng (trang chủ, "没有了", "下一页") với link chapter thật. Chapter content dùng thẻ `<div id=\"chaptercontent\">`.\n\n**Solution:**\n- `page.js`: parse `#indexselect option` values để lấy toàn bộ URL các trang TOC (select chứa tất cả page trong dropdown). Unshift URL gốc vào đầu nếu chưa có.\n- `toc.js`: filter `chapUrl.indexOf(\".html\") < 0` để loại link không phải chapter. Dùng `#list dl a` selector.\n- `chap.js`: dùng `#chaptercontent` selector, remove `.dUAFnx` và các thẻ lạ `nag4bv, wjhu8i, v2uspe, d89e0n` (quảng cáo injected).\n- `detail.js`: dùng `#fmimg img.lazy` với `data-original` fallback `src`, status từ `.visible-xs` chứa "状态：", genre từ breadcrumb `.con_top a:nth-child(2)`."
