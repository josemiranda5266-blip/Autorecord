import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Vehicle,
  MaintenanceItem,
  Expense,
  DocumentRecord,
  MileageLog,
  Reminder,
  UserProfile,
} from '../types';

export type TabType =
  | 'home'
  | 'maintenance'
  | 'expenses'
  | 'documents'
  | 'tips'
  | 'history'
  | 'vehicles'
  | 'profile';
import {
  DEMO_VEHICLE,
  DEMO_MAINTENANCES,
  DEMO_EXPENSES,
  DEMO_DOCUMENTS,
  DEMO_MILEAGE_LOGS,
  DEMO_USER_ID,
} from '../data/initialData';

interface AppContextType {
  user: UserProfile | null;
  isAuthReady: boolean;
  isDemoMode: boolean;
  userPlan: 'free' | 'premium';
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  activeVehicle: Vehicle | null;
  maintenances: MaintenanceItem[];
  expenses: Expense[];
  documents: DocumentRecord[];
  mileageLogs: MileageLog[];
  reminders: Reminder[];
  
  // Active Navigation Tab State
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Auth Actions
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  upgradeToPremium: () => void;

  // Vehicle Actions
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setActiveVehicleId: (id: string) => void;
  
  // Mileage Action
  updateMileage: (vehicleId: string, newMileage: number, notes?: string) => Promise<{ success: boolean; isLower: boolean }>;

  // Maintenance Actions
  addMaintenance: (itemData: Omit<MaintenanceItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateMaintenance: (id: string, itemData: Partial<MaintenanceItem>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
  toggleMaintenanceComplete: (id: string) => Promise<void>;

  // Expense Actions
  addExpense: (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Document Actions
  addDocument: (docData: Omit<DocumentRecord, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateDocument: (id: string, docData: Partial<DocumentRecord>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Export
  exportDataJSON: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'autorecord_app_data_v1';

interface StoredData {
  user: UserProfile | null;
  isDemoMode: boolean;
  userPlan: 'free' | 'premium';
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  maintenances: MaintenanceItem[];
  expenses: Expense[];
  documents: DocumentRecord[];
  mileageLogs: MileageLog[];
  reminders: Reminder[];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Initialize from LocalStorage or Load Default Demo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: StoredData = JSON.parse(saved);
        setUser(parsed.user);
        setIsDemoMode(parsed.isDemoMode);
        setUserPlan(parsed.userPlan || 'free');
        setVehicles(parsed.vehicles || []);
        setActiveVehicleId(parsed.activeVehicleId || null);
        setMaintenances(parsed.maintenances || []);
        setExpenses(parsed.expenses || []);
        setDocuments(parsed.documents || []);
        setMileageLogs(parsed.mileageLogs || []);
        setReminders(parsed.reminders || []);
      } else {
        // First load: load realistic Demo Data for Kangoo 2011
        loadDemoDataInternal();
      }
    } catch (e) {
      console.error('Error loading stored data:', e);
      loadDemoDataInternal();
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isAuthReady) return;
    const dataToSave: StoredData = {
      user,
      isDemoMode,
      userPlan,
      vehicles,
      activeVehicleId,
      maintenances,
      expenses,
      documents,
      mileageLogs,
      reminders,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to write localStorage:', e);
    }
  }, [
    user,
    isDemoMode,
    userPlan,
    vehicles,
    activeVehicleId,
    maintenances,
    expenses,
    documents,
    mileageLogs,
    reminders,
    isAuthReady,
  ]);

  function loadDemoDataInternal() {
    const demoUser: UserProfile = {
      id: DEMO_USER_ID,
      email: 'demo@autorecord.app',
      displayName: 'Usuario Demo (Kangoo 2011)',
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    setIsDemoMode(true);
    setUserPlan('free');
    setVehicles([DEMO_VEHICLE]);
    setActiveVehicleId(DEMO_VEHICLE.id);
    setMaintenances(DEMO_MAINTENANCES);
    setExpenses(DEMO_EXPENSES);
    setDocuments(DEMO_DOCUMENTS);
    setMileageLogs(DEMO_MILEAGE_LOGS);
    setReminders([]);
  }

  const loadDemoData = () => {
    loadDemoDataInternal();
  };

  const clearAllData = () => {
    setUser(null);
    setIsDemoMode(false);
    setUserPlan('free');
    setVehicles([]);
    setActiveVehicleId(null);
    setMaintenances([]);
    setExpenses([]);
    setDocuments([]);
    setMileageLogs([]);
    setReminders([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const login = async (email: string) => {
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      displayName: email.split('@')[0],
      plan: userPlan,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setIsDemoMode(false);
  };

  const register = async (email: string, name: string) => {
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      displayName: name || email.split('@')[0],
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setIsDemoMode(false);
  };

  const logout = () => {
    setUser(null);
  };

  const upgradeToPremium = () => {
    setUserPlan('premium');
    if (user) {
      setUser({ ...user, plan: 'premium' });
    }
  };

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || null;

  // Vehicle Actions
  const addVehicle = async (
    vehicleData: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (userPlan === 'free' && vehicles.length >= 1) {
      throw new Error(
        'El plan Gratuito permite gestionar 1 vehículo. Actualizá a AutoRecord Premium para agregar múltiples vehículos.'
      );
    }

    const id = 'veh_' + Date.now();
    const newVehicle: Vehicle = {
      ...vehicleData,
      id,
      userId: user?.id || 'local_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMain: vehicles.length === 0 || vehicleData.isMain,
    };

    setVehicles((prev) => [...prev, newVehicle]);
    setActiveVehicleId(id);
    return id;
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...vehicleData, updatedAt: new Date().toISOString() } : v))
    );
  };

  const deleteVehicle = async (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setMaintenances((prev) => prev.filter((m) => m.vehicleId !== id));
    setExpenses((prev) => prev.filter((e) => e.vehicleId !== id));
    setDocuments((prev) => prev.filter((d) => d.vehicleId !== id));
    setMileageLogs((prev) => prev.filter((m) => m.vehicleId !== id));

    if (activeVehicleId === id) {
      const remaining = vehicles.filter((v) => v.id !== id);
      setActiveVehicleId(remaining[0]?.id || null);
    }
  };

  // Mileage Update with Warning & Auto-Recalculation
  const updateMileage = async (
    vehicleId: string,
    newMileage: number,
    notes?: string
  ): Promise<{ success: boolean; isLower: boolean }> => {
    const targetVeh = vehicles.find((v) => v.id === vehicleId);
    if (!targetVeh) return { success: false, isLower: false };

    const isLower = newMileage < targetVeh.currentMileage;

    // Save Mileage Log entry
    const newLog: MileageLog = {
      id: 'ml_' + Date.now(),
      userId: user?.id || 'local_user',
      vehicleId,
      mileage: newMileage,
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Actualización de kilometraje',
      createdAt: new Date().toISOString(),
    };

    setMileageLogs((prev) => [newLog, ...prev]);

    // Update vehicle current mileage
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              currentMileage: newMileage,
              updatedAt: new Date().toISOString(),
            }
          : v
      )
    );

    return { success: true, isLower };
  };

  // Maintenance Actions
  const addMaintenance = async (
    itemData: Omit<MaintenanceItem, 'id' | 'userId' | 'createdAt'>
  ) => {
    const newMaint: MaintenanceItem = {
      ...itemData,
      id: 'maint_' + Date.now(),
      userId: user?.id || 'local_user',
      createdAt: new Date().toISOString(),
    };
    setMaintenances((prev) => [newMaint, ...prev]);
  };

  const updateMaintenance = async (id: string, itemData: Partial<MaintenanceItem>) => {
    setMaintenances((prev) => prev.map((m) => (m.id === id ? { ...m, ...itemData } : m)));
  };

  const deleteMaintenance = async (id: string) => {
    setMaintenances((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleMaintenanceComplete = async (id: string) => {
    setMaintenances((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isCompleted: !m.isCompleted } : m))
    );
  };

  // Expense Actions
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: 'exp_' + Date.now(),
      userId: user?.id || 'local_user',
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e)));
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Document Actions
  const addDocument = async (docData: Omit<DocumentRecord, 'id' | 'userId' | 'createdAt'>) => {
    const newDoc: DocumentRecord = {
      ...docData,
      id: 'doc_' + Date.now(),
      userId: user?.id || 'local_user',
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const updateDocument = async (id: string, docData: Partial<DocumentRecord>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...docData } : d)));
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const exportDataJSON = (): string => {
    const exportObj = {
      version: 'AutoRecord 1.0',
      exportedAt: new Date().toISOString(),
      user,
      vehicles,
      maintenances,
      expenses,
      documents,
      mileageLogs,
    };
    return JSON.stringify(exportObj, null, 2);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        isAuthReady,
        isDemoMode,
        userPlan,
        vehicles,
        activeVehicleId,
        activeVehicle,
        maintenances,
        expenses,
        documents,
        mileageLogs,
        reminders,
        login,
        register,
        logout,
        loadDemoData,
        clearAllData,
        upgradeToPremium,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setActiveVehicleId,
        updateMileage,
        addMaintenance,
        updateMaintenance,
        deleteMaintenance,
        toggleMaintenanceComplete,
        addExpense,
        updateExpense,
        deleteExpense,
        addDocument,
        updateDocument,
        deleteDocument,
        exportDataJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
