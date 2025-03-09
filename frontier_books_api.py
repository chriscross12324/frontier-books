import asyncio
import asyncpg
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
import random
from typing import List, Optional


# ========================================
# Configuration Values
# ========================================

# --- Database Connection Values ---
DB_USER = "postgres"
DB_PASSWORD = "spark"
DB_NAME = "frontier_books"
DB_HOST = "localhost"
DB_PORT = 5432

# --- JWT Values ---
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRATION_DELTA_MINUTES_NEW = 60
ACCESS_TOKEN_EXPIRATION_DELTA_MINUTES_RETURNING = 45

# Cryptography context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ========================================
# App & Lifecycle
# ========================================

# --- Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create Connection Pool on Startup
        app.state.db_pool = await asyncpg.create_pool(
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            host=DB_HOST,
            port=DB_PORT,
            min_size=2,
            max_size=10
        )
    except Exception as e:
        print(f"Error Creating Database Pool: {str(e)}")
    yield
    print("Closing Database Pool...")
    await app.state.db_pool.close()
    print("Database Connection Closed.")


# --- FastAPI App ---
app = FastAPI(lifespan=lifespan, root_path="/frontier_books")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================================
# Schemas
# ========================================

# --- General ---
class General_User(BaseModel):
    user_id: Optional[int]
    user_name: str
    user_email: str
    user_password: str

class General_CartItem(BaseModel):
    book_id: int
    book_quantity: int

# --- GET ---
class Get_Book(BaseModel):
    book_id: int
    book_title: str
    book_author: str
    book_description: str
    book_price: float
    book_cover_image_url: str

class Get_Cart(BaseModel):
    user_id: int
    cart_id: int
    cart_items: List[General_CartItem]

class Get_Order(BaseModel):
    user_id: int
    order_id: int
    order_total_cost: float
    order_status: str
    order_checkout_datetime: datetime

class Get_Review(BaseModel):
    review_user_id: int
    review_book_id: int
    review_book_rating: int
    review_text: str

# --- POST ---
class Post_Book(BaseModel):
    book_title: str
    book_author: str
    book_description: str
    book_price: float
    book_cover_image_url: str

class Post_Cart(BaseModel):
    cart_items: List[General_CartItem]

class Post_Order(BaseModel):
    order_items: List[General_CartItem]
    order_total_cost: float

class Review(BaseModel):
    review_book_id: int
    review_book_rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    review_text: str


# ========================================
# Helper Functions
# ========================================

# --- Lease Connection from Database Pool ---
async def lease_db_connection(request: Request):
    async with request.app.state.db_pool.acquire() as connection:
        yield connection

# --- Create an Access Token to Return to the User ---
def create_access_token(key_data: dict, expiration_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRATION_DELTA_MINUTES_NEW)) -> str:
    # Copy original key data to modify later
    key_data_copy = key_data.copy()

    # Calculate the access token's expiration
    access_token_expiration = datetime.now(timezone.utc) + expiration_delta

    # Add the token's expiration to the key data copy
    key_data_copy.update({"exp": access_token_expiration})

    # Encode the access token
    encoded_access_token = jwt.encode(key_data_copy, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_access_token

# --- Retrieve User ID and Role from Access Token ---
def decode_access_token(access_token: str) -> dict:
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        user_role: str = payload.get("user_role", "user")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: Missing User ID")
        
        return {"user_id": user_id, "user_role": user_role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid Token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error Decoding Access Token: {str(e)}")

# --- Verify Plaintext and Hashed Password Match ---
def authenticate_password(plaintext_password: str, hashed_password) -> bool:
    return pwd_context.verify(plaintext_password, hashed_password)

# --- Hash Plaintext Password ---
def hash_password(plaintext_password: str) -> str:
    return pwd_context.hash(plaintext_password)


# ========================================
# API Endpoints
# ========================================

# --- User ---
@app.post("/users")
async def create_user(user_data: General_User, db=Depends(lease_db_connection)):
    try:
        async with db.transaction():
            result = await db.execute(
                "INSERT INTO users (username, email, password_hash, created_at) "
                "VALUES ($1, $2, $3, $4) RETURNING user_id",
                user_data.user_name, user_data.user_email, hash_password(user_data.user_password), datetime.now(timezone.utc)
            )

        # Retrieve user id from result
        user_id = result[0]['user_id']

        # New account role is 'user'
        user_role = "user"

        # Create the access token immediately
        access_token = create_access_token(key_data={"user_id": user_id, "user_role": user_role})

        # Return success message and the access token
        return {
            "message": "User created successfully",
            "access_token": access_token,
            "token_type": "bearer"
        }
    
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error Creating User: Email already registered"
        )
    
    except asyncpg.PostgresError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error Creating User: Database Error ({str(e)})"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error Creating User: {str(e)}"
        )

@app.post("/login")
async def login_user(login_data: General_User, db=Depends(lease_db_connection)):
    try:
        #Check if email and password are provided
        if not login_data.user_email or not login_data.user_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error Logging In User: Email and password are required"
            )
        
        # Retrieve the requested user data from the database by email
        requested_user_data = await db.fetch("SELECT * FROM users WHERE email = $1", login_data.user_email)
        if requested_user_data is None:
            # Don't mention the user doesn't exist (Insecure)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Error Logging In User: Invalid credentials"
            )
        
        if not authenticate_password(plaintext_password=login_data.user_password, hashed_password=requested_user_data['password_hash']):
            # Don't mention which credential is wrong (Insecure)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Error Logging In User: Invalid credentials"
            )
        
        # Create the access token
        access_token_expiration_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRATION_DELTA_MINUTES_RETURNING)
        access_token = create_access_token(key_data={"user_id": requested_user_data['user_id'], "user_role": requested_user_data['user_role']}, expiration_delta=access_token_expiration_delta)

        # Return success message and the access token
        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except asyncpg.PostgresError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error Logging In User: Database Error ({str(e)})"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error Logging In User: {str(e)}"
        )
    





## Book Endpoints
@app.post("/books/")
async def create_book(book: Post_Book, db=Depends(lease_db_connection)):
    await db.execute(
        "INSERT INTO books (title, author, description, price, cover_image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        book.title, book.author, book.description, book.price, book.cover_image_url, datetime.now(timezone.utc)
    )
    return {"message": "Book added successfully"}

@app.get("/books/")
async def get_books(db=Depends(lease_db_connection)):
    books = await db.fetch("SELECT * from books ORDER BY RANDOM()")
    return {"books": books}

@app.get("/book/{book_id}")
async def get_book(book_id: int, db=Depends(lease_db_connection)):
    book = await db.fetch("SELECT * from books WHERE book_id = $1", book_id)
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"book": book}


## Cart Endpoints
@app.post("/cart/")
async def add_to_cart(item: General_CartItem, db=Depends(lease_db_connection)):
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
async def get_cart(user_id: int, db=Depends(lease_db_connection)):
    items = await db.fetch(
        "SELECT b.title, b.author, c.quantity, b.price FROM cart_items c JOIN books b ON c.book_id = b.book_id WHERE c.user_id = $1",
        user_id
    )
    if not items:
        raise HTTPException(status_code=404, detail="Cart is empty or not found")
    return {"cart_items": items}


## Checkout Endpoints
@app.post("/checkout/")
async def checkout(order: Post_Order, db=Depends(lease_db_connection)):
    total_amount = sum()
    await db.execute(
        "INSERT INTO orders (user_id, total_amount, order_status, created_at) VALUES ($1, $2, 'Completed', $3)",
        order.user_id, order.total_amount, datetime.now(timezone.utc)
    )
    await db.execute("DELETE FROM cart_items WHERE user_id = $1", order.user_id)
    return {"message": "Order placed successfully"}

@app.get("/orders/{user_id}")
async def get_orders(user_id: int, db=Depends(lease_db_connection)):
    try:
        orders = await db.fetch("SELECT * FROM orders WHERE user_id = $1", user_id)
    except Exception as e:
        print(f"Failed: {str(e)}")
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")
    return {"orders": orders}


## Review Endpoints
@app.post("/reviews/")
async def create_review(review: Review, db=Depends(lease_db_connection)):
    await db.execute(
        "INSERT INTO reviews (user_id, book_id, rating, review_text, created_at) VALUES ($1, $2, $3, $4, $5)",
        review.user_id, review.book_id, review.rating, review.review_text, datetime.now(timezone.utc)
    )
    return {"message": "Review added"}

@app.get("/reviews/{book_id}")
async def get_reviews(book_id: int, db=Depends(lease_db_connection)):
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
