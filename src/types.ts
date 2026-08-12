export type FuelType = 'Nafta' | 'Diésel' | 'GNC' | 'Híbrido' | 'Eléctrico';
export type TransmissionType = 'Manual' | 'Automática' | 'CVT' | 'Semiautomática';

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  engine: string;
  displacement?: string;
  fuelType: FuelType;
  transmission?: TransmissionType;
  licensePlate: string;
  vin?: string;
  currentMileage: number;
  acquisitionDate: string;
  photoUrl?: string;
  notes?: string;
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
  | 'Líquido de transmisión'
  | 'Correa de distribución'
  | 'Correa auxiliar'
  | 'Tensores'
  | 'Suspensión'
  | 'Dirección'
  | 'Amortiguadores'
  | 'Luces'
  | 'Escobillas'
  | 'Aire acondicionado'
  | 'Sistema de refrigeración'
  | 'Service general'
  | 'VTV/RTO'
  | 'Seguro'
  | 'Otro';

export interface MaintenanceItem {
  id: string;
  userId: string;
  vehicleId: string;
  type: MaintenanceType;
  customType?: string;
  date: string;
  mileage: number;
  cost: number;
  workshop?: string;
  description?: string;
  notes?: string;
  receiptUrl?: string;
  intervalKm?: number;
  intervalMonths?: number;
  nextMileageDue?: number;
  nextDateDue?: string;
  isCompleted: boolean;
  isSafetyComponent?: boolean;
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
  workshop?: string;
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

// 5 URGENCY LEVELS (Core Feature)
export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;

export interface UrgencyInfo {
  level: UrgencyLevel;
  label: 'INFORMATIVO' | 'PREVENTIVO' | 'IMPORTANTE' | 'URGENTE' | 'CRÍTICO';
  badgeBg: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  iconName: string;
  actionText: string;
  shortDescription: string;
}

export interface PreventiveRecommendation {
  id: string;
  vehicleId: string;
  title: string;
  category: MaintenanceType | 'Documento' | 'General';
  reason: string;
  recommendedKmInterval?: number;
  recommendedMonthInterval?: number;
  nextMileageDue?: number;
  nextDateDue?: string;
  remainingKm?: number;
  remainingDays?: number;
  urgency: UrgencyLevel;
  urgencyInfo: UrgencyInfo;
  isSafetyComponent: boolean;
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
  lastCheckedDate: string;
  notes?: string;
  maintenanceItemId?: string;
  documentId?: string;
}

export type OverallVehicleStatus = 'ok' | 'upcoming' | 'attention' | 'overdue';

