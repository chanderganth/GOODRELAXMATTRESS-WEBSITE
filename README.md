# GoodRelax Mattress

Full-stack mattress e-commerce application with custom mattress builder, admin dashboard, order tracking, barcode generation, PDF quotation, and Firebase real-time sync support.

## Tech Stack

- Frontend: Next.js 14 (App Router) + Tailwind CSS + TypeScript
- Backend: Node.js + Express
- Database: Firebase Firestore + Realtime Database
- PDF: jsPDF
- Barcode: jsBarcode (frontend), bwip-js (backend)
- PWA: next-pwa

## Features Implemented

- Product categories:
	- 28D Rare
	- 32D Epic
	- 40D Legendary
- Custom mattress builder:
	- Size input (length, width, thickness)
	- Density selection
	- Layer customization (foam, memory foam, latex, coir, spring)
	- Fabric selection
	- Hardness selection
- Dynamic price calculation:
	- Base sqft pricing
	- Density addition (₹500 / ₹700)
	- Hardness level pricing (5%, 10%, 15%)
- Admin dashboard:
	- Orders overview and status management
	- Product/pricing management UI
	- Customer records page
	- Stock tracking page (foam blocks and materials)
- Barcode system:
	- Barcode generation API
	- Barcode rendering on frontend for order references
- PDF quotation generator:
	- Includes size and price only
	- GST included note
- Order tracking system:
	- Track by order number
	- Production and delivery timeline
- Firebase integration:
	- Firestore for app data
	- Realtime DB notification hook on new orders
- PWA setup:
	- Manifest + service worker generation
	- Offline fallback page

## Project Structure

```text
GOODRELAXMATTRESS-WEBSITE/
	backend/
		src/
			config/
			controllers/
			middleware/
			routes/
			index.js
		.env.example
		package.json

	frontend/
		app/
			admin/
			builder/
			checkout/
			orders/
			products/
			layout.tsx
			page.tsx
		components/
		context/
		lib/
		public/
		.env.local.example
		package.json
```

## Setup

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

Backend:

```bash
cd backend
cp .env.example .env
```

Frontend:

```bash
cd frontend
cp .env.local.example .env.local
```

Fill Firebase credentials in both files.

### 3) Run locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## Build

Frontend production build:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm start
```

## Notes

- Admin-protected backend routes use `x-admin-secret` header.
- Some pages include demo-mode fallbacks for easier local exploration without seeded data.
- Replace placeholder PWA icons in `frontend/public/icons` with branded assets.