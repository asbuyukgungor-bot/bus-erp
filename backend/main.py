
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# --- Security Constants ---
SECRET_KEY = "a_very_secret_key_for_a_bus_erp_project"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

# --- Models ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    role: str # e.g., 'admin', 'mechanic'

class UserInDB(User):
    hashed_password: str

class Part(BaseModel):
    name: str
    part_number: str
    supplier: str
    quantity: int
    price: float

class Vehicle(BaseModel):
    name: str
    vin: str
    make: str
    model: str
    year: int

class WorkOrderItem(BaseModel):
    part_number: str
    quantity_used: int

class WorkOrder(BaseModel):
    id: str = str(uuid.uuid4())
    vehicle_vin: str
    description: str
    status: str = "Pending" # Pending, In Progress, Completed
    items_used: List[WorkOrderItem] = []

class WorkOrderStatusUpdate(BaseModel):
    status: str

class DashboardStats(BaseModel):
    total_parts: int
    low_stock_parts: int
    total_vehicles: int
    open_work_orders: int

class Location(BaseModel):
    id: int
    name: str

# --- Password Hashing Utilities ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- In-memory "Database" ---
db_users = {
    "admin": UserInDB(
        username="admin",
        full_name="Admin User",
        email="admin@example.com",
        hashed_password=get_password_hash("admin"),
        disabled=False,
        role="admin"
    )
}

db_parts: List[Part] = [
    Part(name="Oil Filter", part_number="OF-1022", supplier="Supplier A", quantity=25, price=15.50),
    Part(name="Brake Pad Set", part_number="BP-4510", supplier="Supplier B", quantity=8, price=75.00),
]

db_locations: List[Location] = [
    Location(id=1, name="Main Warehouse"),
    Location(id=2, name="Garage A"),
]

db_vehicles: List[Vehicle] = [
    Vehicle(name="Bus-101", vin="VIN101ABC", make="Mercedes-Benz", model="Tourismo", year=2021),
]

db_work_orders: List[WorkOrder] = []

# --- Helper & Auth Functions ---
def get_user(db, username: str):
    if username in db:
        return db[username]

def authenticate_user(username, password):
    user = get_user(db_users, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_active_user(token: str = Depends(oauth2_scheme)):
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
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db_users, token_data.username)
    if user is None or user.disabled:
        raise credentials_exception
    return user

def find_part(part_number: str) -> Optional[Part]:
    return next((p for p in db_parts if p.part_number == part_number), None)

# --- FastAPI App ---
app = FastAPI(title="Bus ERP - Final")

# --- API Endpoints ---

# Authentication
@app.post("/api/v1/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Users
@app.get("/api/v1/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Dashboard
@app.get("/api/v1/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: User = Depends(get_current_active_user)):
    low_stock_threshold = 10
    low_stock_count = len([p for p in db_parts if p.quantity < low_stock_threshold])
    open_work_orders_count = len([wo for wo in db_work_orders if wo.status != "Completed"])
    return DashboardStats(
        total_parts=len(db_parts),
        low_stock_parts=low_stock_count,
        total_vehicles=len(db_vehicles),
        open_work_orders=open_work_orders_count,
    )

# Parts
@app.post("/api/v1/parts", response_model=Part)
def create_part(part: Part, current_user: User = Depends(get_current_active_user)):
    db_parts.append(part)
    return part

@app.get("/api/v1/parts", response_model=List[Part])
def get_parts(current_user: User = Depends(get_current_active_user)):
    return db_parts

# Vehicles
@app.post("/api/v1/vehicles", response_model=Vehicle)
def create_vehicle(vehicle: Vehicle, current_user: User = Depends(get_current_active_user)):
    db_vehicles.append(vehicle)
    return vehicle

@app.get("/api/v1/vehicles", response_model=List[Vehicle])
def get_vehicles(current_user: User = Depends(get_current_active_user)):
    return db_vehicles

# Locations
@app.get("/api/v1/locations", response_model=List[Location])
def get_locations(current_user: User = Depends(get_current_active_user)):
    return db_locations

# Work Orders
@app.post("/api/v1/work-orders", response_model=WorkOrder)
def create_work_order(order: WorkOrder, current_user: User = Depends(get_current_active_user)):
    for item in order.items_used:
        part = find_part(item.part_number)
        if not part:
            raise HTTPException(status_code=404, detail=f"Part with number {item.part_number} not found.")
        if part.quantity < item.quantity_used:
            raise HTTPException(status_code=400, detail=f"Not enough stock for part {part.name}. Required: {item.quantity_used}, Available: {part.quantity}")
        part.quantity -= item.quantity_used
    db_work_orders.append(order)
    return order

@app.get("/api/v1/work-orders", response_model=List[WorkOrder])
def get_work_orders(current_user: User = Depends(get_current_active_user)):
    return db_work_orders

@app.get("/api/v1/work-orders/{work_order_id}", response_model=WorkOrder)
def get_work_order(work_order_id: str, current_user: User = Depends(get_current_active_user)):
    order = next((wo for wo in db_work_orders if wo.id == work_order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found.")
    return order

@app.put("/api/v1/work-orders/{work_order_id}", response_model=WorkOrder)
def update_work_order_status(work_order_id: str, status_update: WorkOrderStatusUpdate, current_user: User = Depends(get_current_active_user)):
    order = next((wo for wo in db_work_orders if wo.id == work_order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found.")
    order.status = status_update.status
    return order

# --- Static Files Mount ---
app.mount("/", StaticFiles(directory="static", html=True), name="static")
