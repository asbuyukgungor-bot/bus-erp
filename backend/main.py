import uuid
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

# --- Models ---
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

# --- In-memory "Database" ---
db_parts: List[Part] = [
    Part(name="Oil Filter", part_number="OF-1022", supplier="Supplier A", quantity=25, price=15.50),
    Part(name="Brake Pad Set", part_number="BP-4510", supplier="Supplier B", quantity=8, price=75.00),
    Part(name="Headlight Bulb", part_number="HB-9005", supplier="Supplier A", quantity=50, price=12.00),
    Part(name="Wiper Blade", part_number="WB-22", supplier="Supplier C", quantity=5, price=22.75),
]

db_vehicles: List[Vehicle] = [
    Vehicle(name="Bus-101", vin="VIN101ABC", make="Mercedes-Benz", model="Tourismo", year=2021),
    Vehicle(name="Bus-102", vin="VIN102DEF", make="Setra", model="S 516 HD", year=2022),
    Vehicle(name="Shuttle-201", vin="VIN201GHI", make="Ford", model="Transit", year=2023),
]

db_work_orders: List[WorkOrder] = []

# --- FastAPI App ---
app = FastAPI(title="Bus ERP - Final")

# --- Helper Functions ---
def find_part(part_number: str) -> Optional[Part]:
    return next((p for p in db_parts if p.part_number == part_number), None)

# --- API Endpoints ---

# Dashboard
@app.get("/api/v1/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats():
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
def create_part(part: Part):
    db_parts.append(part)
    return part

@app.get("/api/v1/parts", response_model=List[Part])
def get_parts():
    return db_parts

# Vehicles
@app.post("/api/v1/vehicles", response_model=Vehicle)
def create_vehicle(vehicle: Vehicle):
    db_vehicles.append(vehicle)
    return vehicle

@app.get("/api/v1/vehicles", response_model=List[Vehicle])
def get_vehicles():
    return db_vehicles

# Work Orders
@app.post("/api/v1/work-orders", response_model=WorkOrder)
def create_work_order(order: WorkOrder):
    # Business Logic: Decrease stock for parts used
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
def get_work_orders():
    return db_work_orders

@app.get("/api/v1/work-orders/{work_order_id}", response_model=WorkOrder)
def get_work_order(work_order_id: str):
    order = next((wo for wo in db_work_orders if wo.id == work_order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found.")
    return order

@app.put("/api/v1/work-orders/{work_order_id}", response_model=WorkOrder)
def update_work_order_status(work_order_id: str, status_update: WorkOrderStatusUpdate):
    order = next((wo for wo in db_work_orders if wo.id == work_order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found.")
    order.status = status_update.status
    return order

# --- Static Files Mount ---
app.mount("/", StaticFiles(directory="static", html=True), name="static")