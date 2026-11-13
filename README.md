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

## Production

```bash
npm run build
```

Deploy the generated `dist` directory as a normal SPA and configure your web server to fall back to `index.html` for portal routes.

The API and object-storage CORS policies must allow the hostname from which this portal is served.
