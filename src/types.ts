export type FuelType = 'Nafta' | 'Diésel' | 'GNC' | 'Híbrido' | 'Eléctrico';

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  engine: string;
  fuelType: FuelType;
  licensePlate: string;
  currentMileage: number;
  acquisitionDate: string;
  photoUrl?: string;
  isMain?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MileageLog {
  id: string;
  userId: string;
  vehicleId: string;
  mileage: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export type MaintenanceType =
  | 'Cambio de aceite'
  | 'Filtro de aceite'
  | 'Filtro de aire'
  | 'Filtro de combustible'
  | 'Filtro de habitáculo'
  | 'Bujías'
  | 'Batería'
  | 'Frenos'
  | 'Pastillas'
  | 'Discos'
  | 'Neumáticos'
  | 'Alineación'
  | 'Balanceo'
  | 'Refrigerante'
  | 'Líquido de frenos'
  | 'Correa de distribución'
  | 'Correa auxiliar'
  | 'Suspensión'
  | 'Amortiguadores'
  | 'Aire acondicionado'
  | 'Service general'
  | 'VTV/RTO'
  | 'Seguro'
  | 'Otro';

export interface MaintenanceItem {
  id: string;
  userId: string;
  vehicleId: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  cost: number;
  workshop?: string;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  nextMileageDue?: number;
  nextDateDue?: string;
  isCompleted: boolean;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Combustible'
  | 'Mantenimiento'
  | 'Reparación'
  | 'Seguro'
  | 'Impuestos'
  | 'Estacionamiento'
  | 'Lavado'
  | 'Neumáticos'
  | 'Accesorios'
  | 'Otros';

export interface Expense {
  id: string;
  userId: string;
  vehicleId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  mileage?: number;
  description: string;
  createdAt: string;
}

export type DocumentType = 'VTV/RTO' | 'Seguro' | 'Patente' | 'Licencia' | 'Otro';

export interface DocumentRecord {
  id: string;
  userId: string;
  vehicleId: string;
  type: DocumentType;
  title: string;
  expirationDate: string;
  observations?: string;
  fileUrl?: string;
  createdAt: string;
}

export type ReminderStatus = 'ok' | 'upcoming' | 'overdue';

export interface Reminder {
  id: string;
  userId: string;
  vehicleId: string;
  title: string;
  description?: string;
  dueMileage?: number;
  dueDate?: string;
  type: 'mileage' | 'date' | 'combined';
  maintenanceType?: MaintenanceType;
  status?: ReminderStatus;
  isDismissed?: boolean;
  createdAt: string;
}

export type TipCategory =
  | 'motor'
  | 'aceite'
  | 'refrigeración'
  | 'frenos'
  | 'neumáticos'
  | 'batería'
  | 'combustible'
  | 'aire acondicionado'
  | 'conducción'
  | 'limpieza'
  | 'viajes'
  | 'mantenimiento preventivo';

export interface Tip {
  id: string;
  category: TipCategory;
  title: string;
  content: string;
  iconName: string;
  minMileage?: number;
  vehicleAgeYears?: number;
  season?: 'Verano' | 'Invierno' | 'Otoño' | 'Primavera' | 'All';
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

export interface PlanLimits {
  maxVehicles: number;
  unlimitedHistory: boolean;
  advancedStats: boolean;
  documentsEnabled: boolean;
  advancedReminders: boolean;
  exportEnabled: boolean;
  backupEnabled: boolean;
}

export type OverallVehicleStatus = 'ok' | 'upcoming' | 'overdue';
