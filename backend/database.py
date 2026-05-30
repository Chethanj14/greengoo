"""
SQLite database initialization and connection for GreenGrow.
Creates tables: products, orders, order_items, reviews, wishlist.
"""
import sqlite3
from contextlib import contextmanager
from config import DATABASE_PATH


def get_connection():
    """Return a new database connection with row factory for dict-like access."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create all tables and seed initial data if empty."""
    with get_db() as conn:
        c = conn.cursor()

        # Products: extended for plant_type, sunlight, planting_month, watering_schedule
        c.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT NOT NULL,
                image_url TEXT,
                stock INTEGER DEFAULT 0,
                plant_type TEXT,
                sunlight_requirement TEXT,
                planting_month TEXT,
                watering_schedule TEXT,
                is_featured INTEGER DEFAULT 0,
                is_seasonal INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Orders
        c.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                address TEXT NOT NULL,
                total_price REAL NOT NULL,
                payment_method TEXT,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Order items
        c.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        """)

        # Reviews (user ratings and comments)
        c.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                author_name TEXT DEFAULT 'Anonymous',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        """)

        # Wishlist (product_id only - session/local storage can track user)
        c.execute("""
            CREATE TABLE IF NOT EXISTS wishlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                session_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        """)

        # Plant care articles (for Plant Care Guide section)
        c.execute("""
            CREATE TABLE IF NOT EXISTS care_articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Frequently bought together (product_id -> comma-separated related product ids)
        c.execute("""
            CREATE TABLE IF NOT EXISTS product_related (
                product_id INTEGER NOT NULL,
                related_product_id INTEGER NOT NULL,
                PRIMARY KEY (product_id, related_product_id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (related_product_id) REFERENCES products(id)
            )
        """)

        # Check if products table is empty and seed
        c.execute("SELECT COUNT(*) FROM products")
        if c.fetchone()[0] == 0:
            seed_products(c)
        c.execute("SELECT COUNT(*) FROM care_articles")
        if c.fetchone()[0] == 0:
            seed_care_articles(c)


def seed_products(c):
    """Seed initial products for all categories."""
    products = [
        # Plants
        ("Monstera Deliciosa", "Large tropical houseplant with split leaves. Perfect for indoor spaces.", 24.99, "Plants", "/images/monstera.jpg", 50, "indoor", "medium", "March", "Weekly", 1, 0),
        ("Lavender Seeds Pack", "Organic lavender seeds for outdoor gardening. Fragrant and drought-resistant.", 8.99, "Seeds", "/images/lavender-seeds.jpg", 100, "outdoor", "full", "April", "Every 3 days", 1, 1),
        ("Terracotta Pot 12\"", "Classic terracotta pot with drainage hole. Ideal for herbs and succulents.", 14.99, "Pots", "/images/terracotta-pot.jpg", 80, None, None, None, None, 0, 0),
        ("Tomato Cage 48\"", "Sturdy metal support for tomatoes and climbing plants.", 12.99, "Hooks / Supports", "/images/tomato-cage.jpg", 60, "outdoor", "full", None, None, 0, 0),
        ("Organic Potting Mix 10L", "Peat-free potting soil with compost. Suitable for containers and beds.", 18.99, "Soil", "/images/potting-mix.jpg", 120, None, None, None, None, 1, 0),
        ("Worm Castings 2kg", "Organic fertilizer from worm compost. Rich in nutrients.", 22.99, "Organic dung / compost", "/images/worm-castings.jpg", 45, None, None, None, None, 0, 0),
        ("Liquid Fertilizer 500ml", "Balanced NPK liquid feed for indoor and outdoor plants.", 15.99, "Fertilizers", "/images/liquid-fertilizer.jpg", 90, None, None, None, None, 0, 0),
        ("Pruning Shears", "Stainless steel pruning shears for precise cuts.", 19.99, "Gardening tools", "/images/pruning-shears.jpg", 70, None, None, None, None, 0, 0),
        ("Watering Can 2L", "Metal watering can with removable rose for gentle watering.", 16.99, "Watering equipment", "/images/watering-can.jpg", 85, None, None, None, None, 1, 0),
        ("Snake Plant", "Low-maintenance succulent. Tolerates low light and irregular watering.", 18.99, "Plants", "/images/snake-plant.jpg", 55, "indoor", "low", "Any", "Every 2 weeks", 1, 0),
        ("Sunflower Seeds", "Giant sunflower seeds for summer blooms. Easy to grow.", 6.99, "Seeds", "/images/sunflower-seeds.jpg", 200, "outdoor", "full", "April-May", "Daily when dry", 0, 1),
        ("Ceramic Planter Set", "Set of 3 ceramic planters with saucers. Modern design.", 34.99, "Pots", "/images/ceramic-set.jpg", 40, None, None, None, None, 0, 0),
        ("Garden Trowel", "Ergonomic stainless steel trowel for planting and weeding.", 12.99, "Gardening tools", "/images/trowel.jpg", 95, None, None, None, None, 0, 0),
        ("Drip Irrigation Kit", "DIY drip irrigation kit for pots and small gardens.", 29.99, "Watering equipment", "/images/drip-kit.jpg", 35, None, None, None, None, 0, 0),
        ("Compost Bin 80L", "Dual-chamber compost bin for kitchen and garden waste.", 49.99, "Organic dung / compost", "/images/compost-bin.jpg", 25, None, None, None, None, 0, 0),
    ]
    c.executemany(
        """INSERT INTO products (name, description, price, category, image_url, stock, plant_type, sunlight_requirement, planting_month, watering_schedule, is_featured, is_seasonal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        products,
    )
    # Add some "frequently bought together" relations
    c.execute("INSERT INTO product_related (product_id, related_product_id) VALUES (1, 3), (1, 5), (1, 8), (1, 9)")
    c.execute("INSERT INTO product_related (product_id, related_product_id) VALUES (2, 3), (2, 5), (2, 7)")
    c.execute("INSERT INTO product_related (product_id, related_product_id) VALUES (3, 5), (3, 9), (3, 7)")


def seed_care_articles(c):
    """Seed plant care guide articles."""
    articles = [
        ("How to Grow Plants Indoors", "how-to-grow-plants-indoors", "Choose a spot with adequate light, water when the top inch of soil is dry, and feed monthly during growing season. Avoid overwatering and ensure good drainage.", "Indoor", "/images/care-indoor.jpg"),
        ("Watering Schedules by Plant Type", "watering-schedules", "Succulents: every 2-3 weeks. Tropical plants: weekly. Herbs: when topsoil is dry. Always use room-temperature water and drainage.", "Watering", "/images/care-watering.jpg"),
        ("Fertilizer Usage Guide", "fertilizer-usage", "Use a balanced liquid fertilizer every 4-6 weeks in spring and summer. Reduce or stop in winter. Half-strength is often better than full dose.", "Fertilizing", "/images/care-fertilizer.jpg"),
        ("Beginner Gardening Tips", "beginner-gardening-tips", "Start with easy plants like pothos or snake plant. Use quality potting mix, pots with drainage, and place plants according to their light needs.", "Beginners", "/images/care-beginner.jpg"),
    ]
    for title, slug, content, category, image_url in articles:
        c.execute(
            "INSERT INTO care_articles (title, slug, content, category, image_url) VALUES (?, ?, ?, ?, ?)",
            (title, slug, content, category, image_url),
        )
