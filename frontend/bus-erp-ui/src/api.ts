import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interfaces ---
export interface Part {
  name: string;
  part_number: string;
  supplier: string;
  quantity: number;
  price: number;
}

export interface Vehicle {
    name: string;
    vin: string;
    make: string;
    model: string;
    year: number;
}

export interface WorkOrderItem {
    part_number: string;
    quantity_used: number;
}

export interface WorkOrder {
    id: string;
    vehicle_vin: string;
    description: string;
    status: string; // Pending, In Progress, Completed
    items_used: WorkOrderItem[];
}

export interface WorkOrderStatusUpdate {
    status: string;
}

export interface DashboardStats {
    total_parts: number;
    low_stock_parts: number;
    total_vehicles: number;
    open_work_orders: number;
}

export interface Location {
    id: number;
    name: string;
}

// --- API Functions ---
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/dashboard-stats');
  return response.data;
};

export const getLocations = async (): Promise<Location[]> => {
  const response = await apiClient.get('/locations');
  return response.data;
};

export const getParts = async (): Promise<Part[]> => {
  const response = await apiClient.get('/parts');
  return response.data;
};

export const addPart = async (part: Omit<Part, 'id'>): Promise<Part> => {
  const response = await apiClient.post('/parts', part);
  return response.data;
};

export const getVehicles = async (): Promise<Vehicle[]> => {
    const response = await apiClient.get('/vehicles');
    return response.data;
};

export const addVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
    const response = await apiClient.post('/vehicles', vehicle);
    return response.data;
};

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
    const response = await apiClient.get('/work-orders');
    return response.data;
};

export const addWorkOrder = async (workOrder: Omit<WorkOrder, 'id' | 'status'>): Promise<WorkOrder> => {
    const response = await apiClient.post('/work-orders', workOrder);
    return response.data;
};

export const updateWorkOrderStatus = async (work_order_id: string, status: string): Promise<WorkOrder> => {
    const response = await apiClient.put(`/work-orders/${work_order_id}`, { status });
    return response.data;
};