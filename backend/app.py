"""
GreenGrow – Plant Cultivation Store
Flask REST API backend.
"""
import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import DATABASE_PATH
from database import get_db, init_db

app = Flask(__name__)
# Allow frontend on default and fallback ports (e.g. when 5173 is in use, Vite may use 5174)
CORS(app, origins=[
    "http://localhost:5173", "http://localhost:5174", "http://localhost:3000",
    "http://127.0.0.1:5173", "http://127.0.0.1:5174",
])

# Ensure database exists and is initialized
if not os.path.exists(os.path.dirname(DATABASE_PATH)):
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
init_db()


def row_to_dict(row):
    """Convert sqlite3.Row to dict."""
    return dict(row) if row else None


def rows_to_list(rows):
    """Convert list of Row to list of dicts."""
    return [dict(r) for r in rows] if rows else []


# ---------- Products ----------

@app.route("/api/products", methods=["GET"])
def get_products():
    """
    GET /api/products
    Query params: category, min_price, max_price, plant_type, sunlight, search, featured, seasonal
    """
    with get_db() as conn:
        c = conn.cursor()
        sql = "SELECT * FROM products WHERE 1=1"
        params = []

        if request.args.get("category"):
            sql += " AND category = ?"
            params.append(request.args["category"])
        if request.args.get("min_price"):
            sql += " AND price >= ?"
            params.append(float(request.args["min_price"]))
        if request.args.get("max_price"):
            sql += " AND price <= ?"
            params.append(float(request.args["max_price"]))
        if request.args.get("plant_type"):
            sql += " AND (plant_type = ? OR plant_type IS NULL)"
            params.append(request.args["plant_type"])
        if request.args.get("sunlight"):
            sql += " AND (sunlight_requirement = ? OR sunlight_requirement IS NULL)"
            params.append(request.args["sunlight"])
        if request.args.get("search"):
            sql += " AND (name LIKE ? OR description LIKE ?)"
            q = f"%{request.args['search']}%"
            params.extend([q, q])
        if request.args.get("featured") == "1":
            sql += " AND is_featured = 1"
        if request.args.get("seasonal") == "1":
            sql += " AND is_seasonal = 1"

        sql += " ORDER BY name"
        c.execute(sql, params)
        rows = c.fetchall()
    return jsonify(rows_to_list(rows))


@app.route("/api/products/search-suggestions", methods=["GET"])
def search_suggestions():
    """GET /api/products/search-suggestions?q=... - Return product names matching query."""
    q = (request.args.get("q") or "").strip()[:50]
    if not q:
        return jsonify([])
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "SELECT id, name, category FROM products WHERE name LIKE ? OR category LIKE ? LIMIT 10",
            (f"%{q}%", f"%{q}%"),
        )
        rows = c.fetchall()
    return jsonify(rows_to_list(rows))


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """GET /api/products/<id> - Single product with average rating and review count."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = c.fetchone()
        if not row:
            return jsonify({"error": "Product not found"}), 404
        product = dict(row)
        c.execute(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?",
            (product_id,),
        )
        r = c.fetchone()
        product["avg_rating"] = round(float(r["avg_rating"] or 0), 1)
        product["review_count"] = r["review_count"] or 0
    return jsonify(product)


@app.route("/api/products/<int:product_id>/related", methods=["GET"])
def get_related_products(product_id):
    """GET /api/products/<id>/related - Frequently bought together."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            """
            SELECT p.* FROM products p
            INNER JOIN product_related pr ON pr.related_product_id = p.id
            WHERE pr.product_id = ? AND p.stock > 0
            """,
            (product_id,),
        )
        rows = c.fetchall()
        # If no related, return same category
        if not rows:
            c.execute("SELECT category FROM products WHERE id = ?", (product_id,))
            r = c.fetchone()
            if r:
                c.execute(
                    "SELECT * FROM products WHERE category = ? AND id != ? AND stock > 0 LIMIT 4",
                    (r["category"], product_id),
                )
                rows = c.fetchall()
    return jsonify(rows_to_list(rows))


@app.route("/api/products", methods=["POST"])
def create_product():
    """POST /api/products - Create product (admin)."""
    data = request.get_json() or {}
    name = data.get("name")
    price = data.get("price")
    category = data.get("category")
    if not name or price is None or not category:
        return jsonify({"error": "name, price, category required"}), 400
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            """INSERT INTO products (name, description, price, category, image_url, stock,
               plant_type, sunlight_requirement, planting_month, watering_schedule, is_featured, is_seasonal)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                name,
                data.get("description", ""),
                float(price),
                category,
                data.get("image_url", ""),
                int(data.get("stock", 0)),
                data.get("plant_type"),
                data.get("sunlight_requirement"),
                data.get("planting_month"),
                data.get("watering_schedule"),
                int(data.get("is_featured", 0)),
                int(data.get("is_seasonal", 0)),
            ),
        )
        pid = c.lastrowid
    return jsonify({"id": pid, "message": "Product created"}), 201


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """PUT /api/products/<id> - Update product (admin)."""
    data = request.get_json() or {}
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM products WHERE id = ?", (product_id,))
        if not c.fetchone():
            return jsonify({"error": "Product not found"}), 404
        updates = []
        params = []
        for key in ("name", "description", "price", "category", "image_url", "stock",
                    "plant_type", "sunlight_requirement", "planting_month", "watering_schedule",
                    "is_featured", "is_seasonal"):
            if key in data:
                updates.append(f"{key} = ?")
                v = data[key]
                if key in ("is_featured", "is_seasonal"):
                    v = int(v)
                elif key == "price":
                    v = float(v)
                elif key == "stock":
                    v = int(v)
                params.append(v)
        if not updates:
            return jsonify({"error": "No fields to update"}), 400
        params.append(product_id)
        c.execute(f"UPDATE products SET {', '.join(updates)} WHERE id = ?", params)
    return jsonify({"message": "Product updated"})


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """DELETE /api/products/<id> - Delete product (admin)."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("DELETE FROM products WHERE id = ?", (product_id,))
        if c.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404
    return jsonify({"message": "Product deleted"})


# ---------- Orders ----------

@app.route("/api/orders", methods=["GET"])
def get_orders():
    """GET /api/orders - List all orders (admin). Optional: ?limit=50"""
    limit = min(int(request.args.get("limit", 100)), 500)
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "SELECT * FROM orders ORDER BY order_date DESC LIMIT ?",
            (limit,),
        )
        orders = rows_to_list(c.fetchall())
        for o in orders:
            c.execute(
                "SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?",
                (o["order_id"],),
            )
            o["items"] = rows_to_list(c.fetchall())
    return jsonify(orders)


@app.route("/api/orders", methods=["POST"])
def create_order():
    """POST /api/orders - Create order. Body: customer_name, address, payment_method, items: [{product_id, quantity}]"""
    data = request.get_json() or {}
    name = data.get("customer_name")
    address = data.get("address")
    items = data.get("items", [])
    if not name or not address or not items:
        return jsonify({"error": "customer_name, address, items required"}), 400

    order_id = str(uuid.uuid4())[:8].upper()
    total = 0.0
    with get_db() as conn:
        c = conn.cursor()
        for it in items:
            pid, qty = it.get("product_id"), int(it.get("quantity", 1))
            c.execute("SELECT price, stock FROM products WHERE id = ?", (pid,))
            row = c.fetchone()
            if not row:
                return jsonify({"error": f"Product {pid} not found"}), 400
            if row["stock"] < qty:
                return jsonify({"error": f"Insufficient stock for product {pid}"}), 400
            total += float(row["price"]) * qty
        c.execute(
            "INSERT INTO orders (order_id, customer_name, address, total_price, payment_method) VALUES (?, ?, ?, ?, ?)",
            (order_id, name, address, round(total, 2), data.get("payment_method", "card")),
        )
        for it in items:
            pid, qty = it.get("product_id"), int(it.get("quantity", 1))
            c.execute("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", (order_id, pid, qty))
            c.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (qty, pid))
    return jsonify({"order_id": order_id, "total": round(total, 2), "message": "Order placed"}), 201


# ---------- Reviews ----------

@app.route("/api/reviews/<int:product_id>", methods=["GET"])
def get_reviews(product_id):
    """GET /api/reviews/<product_id> - List reviews for a product."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
            (product_id,),
        )
        rows = c.fetchall()
    return jsonify(rows_to_list(rows))


@app.route("/api/reviews", methods=["POST"])
def create_review():
    """POST /api/reviews - Add review. Body: product_id, rating (1-5), comment, author_name (optional)."""
    data = request.get_json() or {}
    pid = data.get("product_id")
    rating = data.get("rating")
    if pid is None or rating is None:
        return jsonify({"error": "product_id and rating required"}), 400
    rating = int(rating)
    if rating < 1 or rating > 5:
        return jsonify({"error": "rating must be 1-5"}), 400
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM products WHERE id = ?", (pid,))
        if not c.fetchone():
            return jsonify({"error": "Product not found"}), 404
        c.execute(
            "INSERT INTO reviews (product_id, rating, comment, author_name) VALUES (?, ?, ?, ?)",
            (pid, rating, data.get("comment", ""), data.get("author_name", "Anonymous")),
        )
        rid = c.lastrowid
    return jsonify({"id": rid, "message": "Review added"}), 201


# ---------- Wishlist ----------

@app.route("/api/wishlist", methods=["GET"])
def get_wishlist():
    """GET /api/wishlist?session_id=... - Get wishlist product IDs (or all if no session)."""
    session_id = request.args.get("session_id", "")
    with get_db() as conn:
        c = conn.cursor()
        if session_id:
            c.execute(
                "SELECT product_id FROM wishlist WHERE session_id = ? ORDER BY created_at DESC",
                (session_id,),
            )
        else:
            c.execute("SELECT product_id FROM wishlist ORDER BY created_at DESC")
        rows = c.fetchall()
    product_ids = [r["product_id"] for r in rows]
    # Optionally return full product objects
    with get_db() as conn:
        c = conn.cursor()
        if product_ids:
            placeholders = ",".join("?" * len(product_ids))
            c.execute(f"SELECT * FROM products WHERE id IN ({placeholders})", product_ids)
            products = rows_to_list(c.fetchall())
            # Preserve order
            by_id = {p["id"]: p for p in products}
            products = [by_id[pid] for pid in product_ids if pid in by_id]
        else:
            products = []
    return jsonify(products)


@app.route("/api/wishlist", methods=["POST"])
def add_to_wishlist():
    """POST /api/wishlist - Add product. Body: product_id, session_id (optional)."""
    data = request.get_json() or {}
    pid = data.get("product_id")
    session_id = data.get("session_id", "")
    if pid is None:
        return jsonify({"error": "product_id required"}), 400
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM products WHERE id = ?", (pid,))
        if not c.fetchone():
            return jsonify({"error": "Product not found"}), 404
        c.execute("SELECT id FROM wishlist WHERE product_id = ? AND session_id = ?", (pid, session_id))
        if c.fetchone():
            return jsonify({"message": "Already in wishlist"}), 200
        c.execute("INSERT INTO wishlist (product_id, session_id) VALUES (?, ?)", (pid, session_id))
    return jsonify({"message": "Added to wishlist"}), 201


@app.route("/api/wishlist/<int:product_id>", methods=["DELETE"])
def remove_from_wishlist(product_id):
    """DELETE /api/wishlist/<product_id>?session_id=... - Remove from wishlist."""
    session_id = request.args.get("session_id", "")
    with get_db() as conn:
        c = conn.cursor()
        if session_id:
            c.execute("DELETE FROM wishlist WHERE product_id = ? AND session_id = ?", (product_id, session_id))
        else:
            c.execute("DELETE FROM wishlist WHERE product_id = ?", (product_id,))
    return jsonify({"message": "Removed from wishlist"})


# ---------- Care articles (Plant Care Guide) ----------

@app.route("/api/care-articles", methods=["GET"])
def get_care_articles():
    """GET /api/care-articles - List all plant care articles."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM care_articles ORDER BY created_at DESC")
        rows = c.fetchall()
    return jsonify(rows_to_list(rows))


@app.route("/api/care-articles/<slug>", methods=["GET"])
def get_care_article(slug):
    """GET /api/care-articles/<slug> - Single article by slug."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM care_articles WHERE slug = ?", (slug,))
        row = c.fetchone()
    if not row:
        return jsonify({"error": "Article not found"}), 404
    return jsonify(dict(row))


# ---------- Admin analytics ----------

@app.route("/api/admin/analytics", methods=["GET"])
def admin_analytics():
    """GET /api/admin/analytics - Total orders, top products, monthly revenue."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue FROM orders")
        summary = dict(c.fetchone())
        c.execute("""
            SELECT p.id, p.name, SUM(oi.quantity) as sold
            FROM order_items oi JOIN products p ON p.id = oi.product_id
            GROUP BY p.id ORDER BY sold DESC LIMIT 10
        """)
        summary["top_products"] = rows_to_list(c.fetchall())
        c.execute("""
            SELECT strftime('%Y-%m', order_date) as month, COUNT(*) as orders, SUM(total_price) as revenue
            FROM orders GROUP BY month ORDER BY month DESC LIMIT 12
        """)
        summary["monthly"] = rows_to_list(c.fetchall())
    return jsonify(summary)


@app.route("/api/admin/sales/export", methods=["GET"])
def export_sales_csv():
    """GET /api/admin/sales/export - CSV of orders for sales report."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM orders ORDER BY order_date DESC")
        orders = c.fetchall()
        lines = ["order_id,customer_name,address,total_price,payment_method,order_date"]
        for o in orders:
            o = dict(o)
            lines.append(f"{o['order_id']},{repr(o['customer_name'])},{repr(o['address'])},{o['total_price']},{o['payment_method'] or ''},{o['order_date']}")
    from flask import Response
    return Response("\n".join(lines), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=greengrow-sales.csv"})


# ---------- Categories (for filters) ----------

@app.route("/api/categories", methods=["GET"])
def get_categories():
    """GET /api/categories - Distinct product categories."""
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT DISTINCT category FROM products ORDER BY category")
        rows = c.fetchall()
    return jsonify([r["category"] for r in rows])


if __name__ == "__main__":
    app.run(debug=True, port=5000)
