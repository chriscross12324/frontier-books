from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.security import OAuth2PasswordBearer
from contextlib import asynccontextmanager
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import asyncpg
import asyncio
import random
from typing import List, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt


# Database Connection Config
DB_USER = "postgres"
DB_PASSWORD = "spark"
DB_NAME = "frontier_books"
DB_HOST = "localhost"
DB_PORT = 5432

# Secret Key for JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Cryptography context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# Create Connection Pool on Startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.db_pool = await asyncpg.create_pool(
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            host=DB_HOST,
            port=DB_PORT,
            min_size=2,
            max_size=10
        )
        print("Database connection pool created successfully.")
        try:
            async with app.state.db_pool.acquire() as conn:
                print("Connection acquired")
        except Exception as e:
            print(f"Error acquiring database pool: {str(e)}")
    except Exception as e:
        print(f"Error creating database pool: {str(e)}")
    yield
    print("Closing database pool")
    await app.state.db_pool.close()
    print("Database connection closed.")


# FastAPI App
app = FastAPI(lifespan=lifespan, root_path="/frontier_books")


# Dependency to get a connection from the pool
async def get_db(request: Request):
    async with request.app.state.db_pool.acquire() as connection:
        yield connection

# Schemas
class User(BaseModel):
    username: str
    email: str
    password: str

class Book(BaseModel):
    id: int
    title: str
    author: str
    description: str
    price: float
    cover_image_url: str

class CartItem(BaseModel):
    user_id: int
    book_id: int
    quantity: int

class Order(BaseModel):
    id: int
    user_id: int
    total_amount: float
    order_status: str
    created_at: datetime

class Review(BaseModel):
    user_id: int
    book_id: int
    rating: int
    review_text: str


# Helper functions for password hashing and JWT token generation
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password:str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db, username: str):
    return db.fetchrow("SELECT * FROM users WHERE username = $1", username)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username


# API Endpoints
## User Endpoints
@app.post("/create-user/")
async def create_user(user: User, db=Depends(get_db)):
    await db.execute(
        "INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, $4)",
        user.username, user.email, get_password_hash(user.password), datetime.now(timezone.utc)
    )
    return {"message": "User created successfully"}

@app.post("/login/")
async def login_for_access_token(login: User, db=Depends(get_db)):
    user = await get_user(db, login.username)
    if user is None or not verify_password(login.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": login.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


## Book Endpoints
@app.post("/books/")
async def create_book(book: Book, db=Depends(get_db)):
    await db.execute(
        "INSERT INTO books (title, author, description, price, cover_image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        book.title, book.author, book.description, book.price, book.cover_image_url, datetime.now(timezone.utc)
    )
    return {"message": "Book added successfully"}

@app.get("/books/")
async def get_books(db=Depends(get_db)):
    books = await db.fetch("SELECT * from books")
    return {"books": books}

@app.get("/book/{book_id}")
async def get_book(book_id: int, db=Depends(get_db)):
    book = await db.fetch("SELECT * from books WHERE book_id = $1", book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"book": book}


## Cart Endpoints
@app.post("/cart/")
async def add_to_cart(item: CartItem, db=Depends(get_db)):
    existing = await db.fetchrow(
        "SELECT quantity FROM cart_items WHERE user_id = $1 AND book_id = $2", item.user_id, item.book_id
    )

    if existing:
        await db.execute(
            "UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND book_id = $3",
            item.quantity, item.user_id, item.book_id
        )
    else:
        await db.execute(
            "INSERT INTO cart_items (user_id, book_id, quantity, added_at) VALUES ($1, $2, $3, $4)",
            item.user_id, item.book_id, item.quantity, datetime.now(timezone.utc)
        )
    return {"message": "Item added to cart"}

@app.get("/cart/{user_id}")
async def get_cart(user_id: int, db=Depends(get_db)):
    items = await db.fetch(
        "SELECT b.title, b.author, c.quantity, b.price FROM cart_items c JOIN books b ON c.book_id = b.book_id WHERE c.user_id = $1",
        user_id
    )
    if not items:
        raise HTTPException(status_code=404, detail="Cart is empty or not found")
    return {"cart_items": items}


## Checkout Endpoints
@app.post("/checkout/")
async def checkout(order: Order, db=Depends(get_db)):
    total_amount = sum()
    await db.execute(
        "INSERT INTO orders (user_id, total_amount, order_status, created_at) VALUES ($1, $2, 'Completed', $3)",
        order.user_id, order.total_amount, datetime.now(timezone.utc)
    )
    await db.execute("DELETE FROM cart_items WHERE user_id = $1", order.user_id)
    return {"message": "Order placed successfully"}

@app.get("/orders/{user_id}")
async def get_orders(user_id: int, db=Depends(get_db)):
    try:
        orders = await db.fetch("SELECT * FROM orders WHERE user_id = $1", user_id)
    except Exception as e:
        print(f"Failed: {str(e)}")
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")
    return {"orders": orders}


## Review Endpoints
@app.post("/reviews/")
async def create_review(review: Review, db=Depends(get_db)):
    await db.execute(
        "INSERT INTO reviews (user_id, book_id, rating, review_text, created_at) VALUES ($1, $2, $3, $4, $5)",
        review.user_id, review.book_id, review.rating, review.review_text, datetime.now(timezone.utc)
    )
    return {"message": "Review added"}

@app.get("/reviews/{book_id}")
async def get_reviews(book_id: int, db=Depends(get_db)):
    reviews = await db.fetch(
        "SELECT u.username, r.rating, r.review_text FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.book_id = $1",
        book_id
    )
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this book")
    return {"reviews": reviews}


## Random Fun
words = [
    "astronaut", "guitar", "elephant", "sunshine", "banana", "ocean", "keyboard", "computer", "vulture",
    "hippopotamus", "planet", "dream", "innovation", "creativity", "wonderful", "perplexing",
    "ancient", "mysterious", "endless", "beautiful", "magnificent", "whale", "penguin", "butterfly",
    "echo", "galaxy", "piano", "river", "cloud", "forest", "mountain", "tiger", "courage", "bravery",
    "space", "cosmic", "fusion", "solar", "miracle", "random", "delightful", "optimistic", "wonder", "inspiration",
    "phoenix", "revolution", "heroic", "energy", "universe", "champion", "victory", "wisdom",
    "paradox", "mystic", "lighthouse", "quantum", "gravity", "philosophy", "ecstasy", "excitement",
    "futuristic", "cathedral", "kingdom", "paradise", "relaxation",
    "breeze", "candle", "reliability", "faith", "tornado", "sunset", "horizon", "refuge", "idea", "dreamer",
    "resilience", "balance", "invincible", "lively", "fate", "confidence", "history", "chaos", "serendipity",
    "sky", "whisper", "brilliant", "calm", "flutter", "radiance", "rainbow",
    "harmony", "canvas", "philosophical", "survival", "depth", "abundance", "destination", "flame", "soulful",
    "radiant", "fascination", "transform", "sunrise", "dawn", "twilight", "triumph", "star",
    "nostalgia", "rejuvenate", "light", "path", "compassion", "revolutionary", "joyful",
    "ambition", "confusion", "mystery", "reflection", "mountainous", "breathtaking", "serenity", "thunder",
    "illusion", "solitude", "vibrant", "seraph", "wilderness", "paradoxical", "monumental", "subtle",
    "transcend", "melancholy", "elixir", "mystical", "luminous", "harvest", "ambrosia", "valor",
    "mosaic", "glistening", "brilliance", "fiery", "arcane", "clarity", "puzzle", "mirage",
    "stratosphere", "vortex", "twist", "reverie", "turbulent", "rebirth", "visionary", "eclipse", "persistence",
    "optimism", "alchemy", "astounding", "awaken", "journey", "perception", "labyrinth", "endurance", "grace",
    "delirium", "refine", "freedom", "adventure", "courageous", "whimsy", "epiphany", "outlook", "dynamic", "vigor",
    "ambitious", "stellar", "majestic", "intrigue", "charisma", "mystify", "momentum", "lullaby",
    "celestial", "phantasm", "paragon", "unravel", "drift", "splendid", "seraphic", "blissful", "vibrance", "serendipitous",
    "affinity", "vision", "gleam", "wanderlust", "transcendent",
    "endeavor", "vivid", "whirlwind", "exhilarate", "intrepid", "vantage", "unique",
    "glimmer", "infinite", "fractal", "cascading", "illumination", "odyssey", "inspire", "wander",
    "arise", "starlight", "euphoria", "time", "quintessential", "infinity", "enlighten", "paradigm", "elevate", "gravitational",
    "reverence", "resonate", "ethereal", "elemental", "soul", "timeless", "wanderer"
]

@app.get("/random/{word_length}")
async def fun_random(word_length: int):
    if word_length < 1 or word_length > 20:
        return {"error": "Word length must be between 1 and 20."}

    # Randomly select words from the list
    sentence = ' '.join(random.choice(words) for _ in range(word_length))

    # Capitalize the first word and add a period at the end
    sentence = sentence.capitalize() + '.'

    return {"sentence": sentence}

@app.get("/test-db")
async def test_db(request: Request):
    async for connection in get_db(request):
        return {"message": f"Database connection successful: {request.state.__dict__}"}