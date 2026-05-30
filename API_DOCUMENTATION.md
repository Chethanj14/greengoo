# GreenGrow REST API Documentation

Base URL: `http://localhost:5000/api`

All responses are JSON unless noted.

---

## Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products. Query: `category`, `min_price`, `max_price`, `plant_type`, `sunlight`, `search`, `featured`, `seasonal` |
| GET | `/products/search-suggestions?q=` | Search suggestions (product names/categories) |
| GET | `/products/<id>` | Single product with avg rating and review count |
| GET | `/products/<id>/related` | Frequently bought together |
| POST | `/products` | Create product (admin). Body: name, price, category, description?, image_url?, stock?, plant_type?, sunlight_requirement?, planting_month?, watering_schedule?, is_featured?, is_seasonal? |
| PUT | `/products/<id>` | Update product (admin) |
| DELETE | `/products/<id>` | Delete product (admin) |

---

## Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List orders (admin). Query: `limit` (default 100) |
| POST | `/orders` | Create order. Body: `customer_name`, `address`, `payment_method?`, `items`: [{ product_id, quantity }] |

---

## Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews/<product_id>` | List reviews for product |
| POST | `/reviews` | Add review. Body: `product_id`, `rating` (1-5), `comment?`, `author_name?` |

---

## Wishlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wishlist?session_id=` | Get wishlist (full product objects) |
| POST | `/wishlist` | Add to wishlist. Body: `product_id`, `session_id?` |
| DELETE | `/wishlist/<product_id>?session_id=` | Remove from wishlist |

---

## Plant Care Guide

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/care-articles` | List all articles |
| GET | `/care-articles/<slug>` | Single article by slug |

---

## Admin & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Summary: total_orders, total_revenue, top_products, monthly (orders & revenue) |
| GET | `/admin/sales/export` | CSV download of orders (Content-Disposition: attachment) |

---

## Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Distinct product categories |
