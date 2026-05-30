# GreenGrow – Plant Cultivation Store

Full-stack e-commerce web application for plant cultivation products (plants, seeds, pots, soil, tools, etc.) with a **green nature theme**.

## Tech Stack

- **Frontend:** React (functional components + hooks), React Router, Axios, Tailwind CSS
- **Backend:** Flask (Python REST API), Flask-CORS
- **Database:** SQLite

## Project Structure

```
GreenGrow/
├── frontend/          # React app (Vite)
├── backend/           # Flask API
├── database/          # SQLite DB (created on first run)
├── API_DOCUMENTATION.md
└── README.md
```

## Quick Start

### 1. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API runs at **http://localhost:5000**. The SQLite database is created at `../database/greengrow.db` on first run, with seed products and care articles.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5174** (or the port shown in the terminal if that’s in use). Vite proxies `/api` to the Flask backend. Open that URL in your browser to use the app.

### 3. Use the app

- **Home:** Featured and seasonal products, links to catalog, care guide, garden planner.
- **Shop (Catalog):** Search, filter by category, price, plant type, sunlight.
- **Product detail:** Image, description, price, stock, ratings, reviews, “Frequently Bought Together”, add to cart/wishlist.
- **Cart:** Update quantity, remove items, proceed to checkout.
- **Checkout:** Customer name, address, payment method; places order and shows confirmation.
- **Wishlist:** Save products for later (persisted via API with session).
- **Care Guide:** Articles on watering, fertilizing, beginner tips.
- **Garden Planner:** Select plants to see watering schedule, sunlight, planting month.
- **Admin:** Analytics (orders, revenue, top products, monthly), orders list, product CRUD, CSV export.

## API Overview

See **API_DOCUMENTATION.md** for full endpoint list. Summary:

- **Products:** `GET/POST /api/products`, `GET/PUT/DELETE /api/products/<id>`, search, filters, related.
- **Orders:** `POST /api/orders`, `GET /api/orders`.
- **Reviews:** `GET /api/reviews/<product_id>`, `POST /api/reviews`.
- **Wishlist:** `GET/POST /api/wishlist`, `DELETE /api/wishlist/<product_id>`.
- **Care articles:** `GET /api/care-articles`, `GET /api/care-articles/<slug>`.
- **Admin:** `GET /api/admin/analytics`, `GET /api/admin/sales/export` (CSV).

## Features

- Modern responsive UI (green theme, mobile-friendly).
- Product catalog with search and filters (category, price, plant type, sunlight).
- Product detail with ratings, reviews, “Frequently Bought Together”.
- Shopping cart (add/remove/update quantity, total), checkout, order confirmation.
- Wishlist (session-based).
- Plant Care Guide (articles).
- Garden Planner (selected plants show watering, sunlight, planting month).
- Admin: add/edit/delete products, manage stock, view orders, analytics, CSV export.

## License

MIT.
