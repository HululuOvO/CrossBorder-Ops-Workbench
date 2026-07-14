# CrossBorder Ops Workbench

A public, privacy-friendly ecommerce operations workbench for marketplace listing support.

This is the **public website version** of the workbench. It is designed for GitHub Pages and does not include private SOP screenshots, real store data, private product data, internal file paths, account information, or company-specific workflow assets.

## What It Includes

- Dashboard for ecommerce operations modules
- Amazon single-product listing field helper
- Walmart EAN and product-row pairing helper
- Warehouse preparation checklist
- Unit converter for cm / mm / in and g / kg / lb
- Chinese / English / Spanish color library
- Public SOP workflow cards

## Privacy Model

This version runs in the browser. Product rows are processed locally by the page and are not uploaded to a server by this static website.

Do not commit private SOP files, screenshots, store IDs, supplier data, account screenshots, private SKUs, or internal documents to a public GitHub repository.

## Supported Files

- CSV / TSV: supported directly in the browser
- XLSX / XLS: supported through the browser SheetJS CDN when the page is online

For the most stable public deployment, you can export spreadsheets as CSV before uploading.

## Publish With GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the repository root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
   - `.nojekyll`
3. In GitHub, open **Settings > Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Select branch `main` and folder `/root`.
6. Save. GitHub will generate a public URL like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

## When You Need a Backend

GitHub Pages is static hosting. It is excellent for public UI, copy helpers, converters, and browser-side file parsing.

Use a backend later if you need:

- Secure user accounts
- Private SOP storage
- Large XLSX processing
- Database history
- Team permissions
- Cloud file storage
- AI model calls with protected API keys

Recommended future stack:

- Frontend: this static site or React
- Backend: FastAPI / Flask / Node.js
- Hosting: Render, Railway, Fly.io, Vercel, or a private cloud server
- Private SOP files: private GitHub repository, Google Drive, or object storage

## Public Data Rule

Before publishing, run a simple text search for private terms and remove anything that should not be public.

This public package intentionally uses generic examples only.
