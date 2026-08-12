import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
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

import { vehicleService } from '../services/vehicleService';
import { maintenanceService } from '../services/maintenanceService';
import { expenseService } from '../services/expenseService';
import { documentService } from '../services/documentService';
import { mileageService } from '../services/mileageService';
import { migrationService } from '../services/migrationService';

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
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, name: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    if (!auth) {
      // Local fallback mode when Firebase Auth isn't initialized
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
          loadDemoDataInternal();
        }
      } catch (e) {
        console.error('Error loading stored local data:', e);
        loadDemoDataInternal();
      } finally {
        setIsAuthReady(true);
      }
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          plan: userPlan,
          createdAt: new Date().toISOString(),
        };
        setUser(userProfile);
        setIsDemoMode(false);

        // Check for local data migration
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            const parsed: StoredData = JSON.parse(saved);
            if (
              parsed.vehicles.length > 0 ||
              parsed.maintenances.length > 0 ||
              parsed.expenses.length > 0
            ) {
              await migrationService.migrateLocalDataToFirestore(firebaseUser.uid, {
                vehicles: parsed.vehicles,
                maintenances: parsed.maintenances,
                expenses: parsed.expenses,
                documents: parsed.documents,
                mileageLogs: parsed.mileageLogs,
              });
            }
          }
        } catch (mErr) {
          console.warn('Local migration check skipped:', mErr);
        }

        // Setup Firestore listeners
        const unSubVehicles = vehicleService.subscribeVehicles(firebaseUser.uid, (vList) => {
          setVehicles(vList);
          if (vList.length > 0) {
            setActiveVehicleId((prev) => (prev && vList.some((v) => v.id === prev) ? prev : vList[0].id));
          } else {
            setActiveVehicleId(null);
          }
        });

        const unSubMaint = maintenanceService.subscribeMaintenances(firebaseUser.uid, setMaintenances);
        const unSubExp = expenseService.subscribeExpenses(firebaseUser.uid, setExpenses);
        const unSubDoc = documentService.subscribeDocuments(firebaseUser.uid, setDocuments);
        const unSubMileage = mileageService.subscribeMileageLogs(firebaseUser.uid, setMileageLogs);

        setIsAuthReady(true);

        return () => {
          unSubVehicles();
          unSubMaint();
          unSubExp();
          unSubDoc();
          unSubMileage();
        };
      } else {
        // User logged out
        setUser(null);
        // If not in demo mode, clear user data
        if (!isDemoMode) {
          setVehicles([]);
          setActiveVehicleId(null);
          setMaintenances([]);
          setExpenses([]);
          setDocuments([]);
          setMileageLogs([]);
        }
        setIsAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Save local fallback cache
  useEffect(() => {
    if (!isAuthReady) return;
    if (user && db) return; // Do not overwrite local storage when synced with Firestore

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

  // Auth Actions
  const login = async (email: string, pass: string) => {
    if (auth) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (error: unknown) {
        console.error('Firebase Auth login error:', error);
        throw new Error(
          error instanceof Error
            ? error.message.replace('Firebase: ', '')
            : 'No se pudo iniciar sesión. Verificá tu correo y contraseña.'
        );
      }
    } else {
      // Local fallback
      const newUser: UserProfile = {
        id: 'usr_' + Date.now(),
        email,
        displayName: email.split('@')[0],
        plan: userPlan,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      setIsDemoMode(false);
    }
  };

  const register = async (email: string, name: string, pass: string) => {
    if (auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        if (res.user && name) {
          await updateProfile(res.user, { displayName: name });
        }
      } catch (error: unknown) {
        console.error('Firebase Auth register error:', error);
        throw new Error(
          error instanceof Error
            ? error.message.replace('Firebase: ', '')
            : 'No se pudo crear la cuenta.'
        );
      }
    } else {
      // Local fallback
      const newUser: UserProfile = {
        id: 'usr_' + Date.now(),
        email,
        displayName: name || email.split('@')[0],
        plan: 'free',
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      setIsDemoMode(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const logout = async () => {
    if (auth) {
      await fbSignOut(auth);
    }
    clearAllData();
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
    const userId = user?.id || 'local_user';
    const newVehicle: Vehicle = {
      ...vehicleData,
      id,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMain: vehicles.length === 0 || vehicleData.isMain,
    };

    if (db && user && !isDemoMode) {
      await vehicleService.addVehicle(newVehicle);
    } else {
      setVehicles((prev) => [...prev, newVehicle]);
    }
    setActiveVehicleId(id);
    return id;
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    if (db && user && !isDemoMode) {
      await vehicleService.updateVehicle(id, vehicleData);
    } else {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...vehicleData, updatedAt: new Date().toISOString() } : v))
      );
    }
  };

  const deleteVehicle = async (id: string) => {
    if (db && user && !isDemoMode) {
      await vehicleService.deleteVehicle(id);
      await maintenanceService.deleteByVehicle(user.id, id);
      await expenseService.deleteByVehicle(user.id, id);
      await documentService.deleteByVehicle(user.id, id);
    } else {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setMaintenances((prev) => prev.filter((m) => m.vehicleId !== id));
      setExpenses((prev) => prev.filter((e) => e.vehicleId !== id));
      setDocuments((prev) => prev.filter((d) => d.vehicleId !== id));
      setMileageLogs((prev) => prev.filter((m) => m.vehicleId !== id));
    }

    if (activeVehicleId === id) {
      const remaining = vehicles.filter((v) => v.id !== id);
      setActiveVehicleId(remaining[0]?.id || null);
    }
  };

  // Mileage Update with Validation & Storage
  const updateMileage = async (
    vehicleId: string,
    newMileage: number,
    notes?: string
  ): Promise<{ success: boolean; isLower: boolean }> => {
    if (newMileage < 0) {
      throw new Error('El kilometraje no puede ser negativo.');
    }

    const targetVeh = vehicles.find((v) => v.id === vehicleId);
    if (!targetVeh) return { success: false, isLower: false };

    const isLower = newMileage < targetVeh.currentMileage;
    const userId = user?.id || 'local_user';

    const newLog: MileageLog = {
      id: 'ml_' + Date.now(),
      userId,
      vehicleId,
      mileage: newMileage,
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Actualización de kilometraje',
      createdAt: new Date().toISOString(),
    };

    if (db && user && !isDemoMode) {
      await mileageService.addMileageLog(newLog);
      await vehicleService.updateVehicle(vehicleId, { currentMileage: newMileage });
    } else {
      setMileageLogs((prev) => [newLog, ...prev]);
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
    }

    return { success: true, isLower };
  };

  // Maintenance Actions
  const addMaintenance = async (
    itemData: Omit<MaintenanceItem, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (itemData.cost < 0) {
      throw new Error('El costo no puede ser negativo.');
    }
    const id = 'maint_' + Date.now();
    const userId = user?.id || 'local_user';
    const newMaint: MaintenanceItem = {
      ...itemData,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (db && user && !isDemoMode) {
      await maintenanceService.addMaintenance(newMaint);
    } else {
      setMaintenances((prev) => [newMaint, ...prev]);
    }
  };

  const updateMaintenance = async (id: string, itemData: Partial<MaintenanceItem>) => {
    if (itemData.cost !== undefined && itemData.cost < 0) {
      throw new Error('El costo no puede ser negativo.');
    }
    if (db && user && !isDemoMode) {
      await maintenanceService.updateMaintenance(id, itemData);
    } else {
      setMaintenances((prev) => prev.map((m) => (m.id === id ? { ...m, ...itemData } : m)));
    }
  };

  const deleteMaintenance = async (id: string) => {
    if (db && user && !isDemoMode) {
      await maintenanceService.deleteMaintenance(id);
    } else {
      setMaintenances((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const toggleMaintenanceComplete = async (id: string) => {
    const item = maintenances.find((m) => m.id === id);
    if (!item) return;

    if (db && user && !isDemoMode) {
      await maintenanceService.updateMaintenance(id, { isCompleted: !item.isCompleted });
    } else {
      setMaintenances((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isCompleted: !m.isCompleted } : m))
      );
    }
  };

  // Expense Actions
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (expenseData.amount < 0) {
      throw new Error('El monto del gasto no puede ser negativo.');
    }
    const id = 'exp_' + Date.now();
    const userId = user?.id || 'local_user';
    const newExp: Expense = {
      ...expenseData,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (db && user && !isDemoMode) {
      await expenseService.addExpense(newExp);
    } else {
      setExpenses((prev) => [newExp, ...prev]);
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    if (expenseData.amount !== undefined && expenseData.amount < 0) {
      throw new Error('El monto del gasto no puede ser negativo.');
    }
    if (db && user && !isDemoMode) {
      await expenseService.updateExpense(id, expenseData);
    } else {
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e)));
    }
  };

  const deleteExpense = async (id: string) => {
    if (db && user && !isDemoMode) {
      await expenseService.deleteExpense(id);
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Document Actions
  const addDocument = async (docData: Omit<DocumentRecord, 'id' | 'userId' | 'createdAt'>) => {
    const id = 'doc_' + Date.now();
    const userId = user?.id || 'local_user';
    const newDoc: DocumentRecord = {
      ...docData,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };

    if (db && user && !isDemoMode) {
      await documentService.addDocument(newDoc);
    } else {
      setDocuments((prev) => [newDoc, ...prev]);
    }
  };

  const updateDocument = async (id: string, docData: Partial<DocumentRecord>) => {
    if (db && user && !isDemoMode) {
      await documentService.updateDocument(id, docData);
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...docData } : d)));
    }
  };

  const deleteDocument = async (id: string) => {
    if (db && user && !isDemoMode) {
      await documentService.deleteDocument(id);
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const exportDataJSON = (): string => {
    const exportObj = {
      version: 'AutoRecord 2.0',
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
        resetPassword,
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
