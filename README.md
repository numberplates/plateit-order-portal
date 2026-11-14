# Order Status Portal

A lightweight Vue 3 + Vite customer order-status and secure document-upload portal for Plateit.

## Included

- Company-scoped routes such as `/c123/status` and `/c123/status/456`.
- Optional development/default company redirect from `/` using `VITE_COMPANY_ID`.
- Scoped JWT authentication stored in `sessionStorage`.
- Order, address, package, totals and public-note display.
- Parent-owned order state with non-destructive refreshes after document uploads.
- Document requirement/status display and rejected-document replacement uploads.
- Browser-side crop and rotate controls using Cropper.js.
- Image resizing/compression before direct presigned object-storage uploads.
- Tailwind CSS via the Vite plugin. Production builds include only generated CSS needed by the application rather than shipping the full Tailwind framework.
- No customer-side retrieval or preview of previously uploaded sensitive documents.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Configure:

```env
VITE_API_URL=https://api.plateit.co.uk
VITE_COMPANY_ID=123
```

`VITE_COMPANY_ID` is only used for the convenient `/` redirect. Production links can go directly to `/c123/status`.

## Company Configuration

Defaults live in the version-controlled `src/config/companies.js`. Company overrides live in the Git-ignored `config/companies/` directory, with one JavaScript file per company ID:

Optionally create `config/defaults.js` to override the hard-coded defaults for all companies:

```js
export default {
  loginButtonText: 'View My Order'
}
```

Settings are merged in order: hard-coded defaults → `config/defaults.js` → `config/companies/<id>.js`. Each file can override any subset of fields. The entire `config/` directory is Git-ignored and optional.

```bash
mkdir -p config/companies public/company-assets
cp src/config/company.example.js config/companies/123.js
```

Edit `123.js` for `/c123/status`:

```js
export default {
  loginTitle: 'Welcome to Example Plates',
  loginButtonText: 'View My Order',
  loginIntroduction: 'Enter your order details to securely upload your supporting documents.',
  logoUrl: '/company-assets/example-plates.svg',
  logoAlt: 'Example Plates'
}
```

All fields are optional. Companies without configuration use the defaults, including no logo. `loginButtonText` defaults to `Access Order`; the loading label remains `Accessing Order…`. Logos appear on both the login and order pages; unavailable images are hidden. Introduction text is rendered as plain text.

Place company logos in the Git-ignored `public/company-assets/` directory and reference them as `/company-assets/filename.svg` (PNG and other browser-supported formats also work), or use an HTTPS image URL. Set `logoAlt` to the company name for accessibility.

Existing sample company overrides and logos have been moved into these local directories. They will not be included in new checkouts. Supply these directories separately on each development or build machine before building. Both directories are optional: a clean checkout builds using defaults alone. Keep a separate backup of your local configuration and assets.

Configuration changes require a rebuild and redeploy; no API changes are needed. The resulting configuration and logos are public frontend content, even though their source files are Git-ignored; do not include secrets.

## Production

```bash
npm run build
```

Deploy the generated `dist` directory as a normal SPA and configure your web server to fall back to `index.html` for portal routes.

The API and object-storage CORS policies must allow the hostname from which this portal is served.
