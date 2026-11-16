# Plateit Order Portal

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
- Plain CSS with shared component classes, responsive layouts and print styles; no CSS framework dependency.
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
  loginOrderIdLabel: 'Order Reference',
  loginEmailLabel: 'Your Email Address',
  loginIntroduction: 'Enter your order details to securely upload your supporting documents.',
  logoUrl: '/company-assets/example-plates.svg',
  logoAlt: 'Example Plates',
  faviconUrl: '/company-assets/example-favicon.svg'
}
```

All fields are optional. Companies without configuration use the defaults, including no logo. `loginButtonText` defaults to `Access Order`; the loading label remains `Accessing Order…`. Logos appear on both the login and order pages; unavailable images are hidden. Introduction text is rendered as plain text.

Login field labels are configurable with `loginOrderIdLabel` (default: `Order Number`) and `loginEmailLabel` (default: `Email Address`). Set them in `config/defaults.js` or a company's configuration; omitted labels inherit the defaults.

Place company logos in the Git-ignored `public/company-assets/` directory and reference them as `/company-assets/filename.svg` (PNG and other browser-supported formats also work), or use an HTTPS image URL. Set `logoAlt` to the company name for accessibility.

The app includes a default favicon at `public/favicon.svg`. Override `faviconUrl` in `config/defaults.js` for a shared installation default, or in `config/companies/<id>.js` for a company-specific favicon. Omitted values inherit the normal configuration defaults. Empty or null values use the app favicon. Store local company favicons in `public/company-assets/` and reference them as `/company-assets/filename.svg` (PNG and ICO also work), or use an HTTPS URL. The favicon updates when the company route changes, including a return to the default for unconfigured companies.

Existing sample company overrides and logos have been moved into these local directories. They will not be included in new checkouts. Supply these directories separately on each development or build machine before building. Both directories are optional: a clean checkout builds using defaults alone. Keep a separate backup of your local configuration and assets.

Configuration changes require a rebuild and redeploy; no API changes are needed. The resulting configuration and logos are public frontend content, even though their source files are Git-ignored; do not include secrets.

Set `loginRequireConfirmationLink: true` in a company's configuration (or `config/defaults.js`) for link-only login, for example `/c1/status?order_id=1234&email=john%40example.com`. Both query parameters must be single, non-empty strings. Missing, blank or repeated parameters show a malformed-link notice instead of the login form. Supplied fields are disabled and skipped during keyboard navigation; their values are still validated and submitted from Vue state. The default is `false`, allowing normal editable login. This setting does not change authentication or prevent someone editing the URL.

When `expired=1` is present, link-only login instructs the user to re-follow their confirmation link and hides the form. Editable login keeps its form and instructs the user to re-enter their order details. The expiry notice takes precedence over the malformed-link notice, since expiry redirects do not include the order number or email parameters.

Optionally set `loginMalformedLinkMessage` in shared or company configuration to replace the malformed-link notice.

Optionally set `loginExpiryMessage: 'Your custom expiry notice'` in shared or company configuration to replace the entire expiry message. Omit it or set it to `null` to use the appropriate default for the login mode.

## Company Styling

Styling lives entirely in CSS. Define shared overrides in optional `config/defaults.css` and company-specific overrides in `config/companies/<id>.css`:

```css
.portal {
  --portal-primary-color: #0f766e;
  --portal-primary-hover-color: #115e59;
  --portal-primary-text-color: #ffffff;
  --portal-page-background: #e6f4f1;
  --portal-surface-color: #ffffff;
  --portal-text-color: #134e4a;
  --portal-border-radius: 1.5rem;
}
```

The cascade applies tracked defaults from `src/style.css`, then shared local CSS, then the active company's CSS. Omitted variables inherit their defaults. Variables control primary buttons, page backgrounds, cards and input focus borders. `--portal-text-color` supplies inherited text colour; use custom CSS for elements with explicit text colours.

When changing companies, the previous custom stylesheet is removed. Local CSS files are Git-ignored and included at build time. Use ordinary CSS; files are loaded directly without preprocessing. JS configuration handles text, logos and favicons.

Available styling hooks include `.portal`, `.portal-page`, `.portal-login`, `.portal-login-card`, `.portal-order`, `.portal-card`, `.portal-upload-modal`, `.portal-button`, `.portal-button-primary`, `.portal-button-secondary` and `.portal-input`. Theme values are available as CSS variables such as `--portal-primary-color`. Prefix selectors with `.portal` to keep styles within the application:

```css
.portal .portal-login-card { max-width: 56rem; }
.portal .portal-button-primary { text-transform: uppercase; }
```

The local company 2 example uses `config/companies/2.css` for a wide split login, serif headings and rounded controls. Compare `/c2/status` with company 1's compact monochrome `/c1/status`. On small screens, company 2's login stacks vertically. Copy the ignored files separately to build machines, then rebuild to apply changes.

The app stylesheet (`src/style.css`) uses two cascade layers: `base` for reset/default variables and `components` for shared styles. Company CSS remains unlayered, so overrides take precedence without `!important`. Reusable classes include `.card-header`, `.card-body`, `.card-grid`, `.form-field`, `.form-actions`, `.status-badge` and `.portal-table`. Button, input and presentation hooks retain their existing names. Status colours use `.badge-neutral`, `.badge-warning`, `.badge-success` and `.badge-error`.

Modal class props now accept plain CSS class names: the default width is `.modal-standard`; `.modal-panel` handles scrolling and viewport height. Existing custom CSS that targeted Tailwind utility classes should target the semantic classes instead. The example company styles and packing-slip hooks continue to work.

## Presentation Hooks

Company stylesheets can hide or restyle these classes without depending on element positions. Classes repeat safely across packages; they are not unique HTML IDs. Existing appearance and behaviour stay the same until you add overrides.

| Area | Classes |
| --- | --- |
| Order header | `.order-header`, `.order-number`, `.order-status`, `.order-date` |
| Party cards | `.order-parties`, `.order-company`, `.order-customer` |
| Documents | `.order-documents-section` (whole area), `.order-documents` (card), `.documents-table` |
| Packages | `.order-package`, `.package-plates`, `.package-products` |
| Shipping | `.package-shipping`, `.shipping-name`, `.shipping-price`, `.shipping-tracking`, `.shipping-despatched` |
| Tables | `.plates-table`, `.products-table` |
| Totals | `.order-totals-section` (whole area), `.order-totals` (card) |
| Notes | `.order-notes` (all notes), `.order-notes-section` (order notes only), `.package-notes` (package notes only) |

Table columns have the same class on their header and every corresponding data cell:

| Table | Column classes |
| --- | --- |
| Plates | `.plate-registration`, `.plate-type`, `.plate-size`, `.plate-price`, `.plate-quantity` |
| Products | `.product-name`, `.product-price`, `.product-quantity` |
| Documents | `.document-action`, `.document-type`, `.document-reference`, `.document-status`, `.document-reason` (when rejections exist) |

`.order-price` groups plate and product price columns (headers and cells) plus the shipping price. Shipping service and tracking remain visible when you hide it. To hide all prices and totals on screen and in print:

```css
.portal .order-price,
.portal .order-totals-section {
  display: none;
}
```

A ready-to-copy example is included at `examples/packing-slip.css`. Copy or append its contents to `config/companies/<id>.css`, or to `config/defaults.css` for all companies, then rebuild. It also relaxes table minimum widths after hiding price columns. It is not enabled automatically and does not replace any existing company stylesheet.

Use an `@media print` block if an override should apply only to the printed packing slip. The existing `.print-hidden` rules still hide document uploads and action buttons in print. These hooks change presentation only; data remains available in the API and markup.

## Production

```bash
npm run build
```

Deploy the generated `dist` directory as a normal SPA and configure your web server to fall back to `index.html` for portal routes.

In direct mode, the API and object-storage CORS policies must allow the hostname from which this portal is served.

## External Proxies

The portal stays static. Companies that need a CORS workaround can deploy a separate proxy service and configure the frontend before building:

```env
VITE_API_URL=/api
VITE_UPLOAD_PROXY_URL=/uploads
```

`VITE_API_URL` supports an absolute API/proxy base or a same-origin path, including a prefix such as `/api`. `VITE_UPLOAD_PROXY_URL` optionally routes document uploads through an external multipart POST endpoint; leave it blank for direct storage uploads. Both settings are independent. A same-origin proxy avoids CORS requirements; a cross-origin proxy needs its own CORS policy allowing the portal.

The optional proxy will be provided in a separate repository, with its own setup and deployment documentation. No backend is bundled here. Run `npm test` for client routing and upload checks.

## Plate Previews

Number plate registrations in the order package table are clickable. A protected
`design_preview` path is resolved to a temporary signed URL and displayed in a
modal. When a package contains multiple plates, the customer can cycle through
them using the previous/next controls or the left/right arrow keys.
