import { vehicleService } from './vehicleService';
import { maintenanceService } from './maintenanceService';
import { expenseService } from './expenseService';
import { documentService } from './documentService';
import { mileageService } from './mileageService';
import { Vehicle, MaintenanceItem, Expense, DocumentRecord, MileageLog } from '../types';

const MIGRATION_FLAG_KEY = 'autorecord_migrated_uid_';

export interface LocalDataToMigrate {
  vehicles: Vehicle[];
  maintenances: MaintenanceItem[];
  expenses: Expense[];
  documents: DocumentRecord[];
  mileageLogs: MileageLog[];
}

export const migrationService = {
  hasBeenMigrated(userId: string): boolean {
    return localStorage.getItem(MIGRATION_FLAG_KEY + userId) === 'true';
  },

  markAsMigrated(userId: string): void {
    localStorage.setItem(MIGRATION_FLAG_KEY + userId, 'true');
  },

  async migrateLocalDataToFirestore(
    userId: string,
    localData: LocalDataToMigrate
  ): Promise<{ success: boolean; migratedCount: number; error?: string }> {
    if (this.hasBeenMigrated(userId)) {
      return { success: true, migratedCount: 0 };
    }

    try {
      let migratedCount = 0;

      // Map vehicle IDs if needed, ensure userId is attached
      const vehicleMap = new Map<string, string>();

      for (const v of localData.vehicles) {
        const newVehicle: Vehicle = {
          ...v,
          userId,
        };
        await vehicleService.addVehicle(newVehicle);
        vehicleMap.set(v.id, newVehicle.id);
        migratedCount++;
      }

      for (const m of localData.maintenances) {
        const newMaint: MaintenanceItem = {
          ...m,
          userId,
          vehicleId: vehicleMap.get(m.vehicleId) || m.vehicleId,
        };
        await maintenanceService.addMaintenance(newMaint);
        migratedCount++;
      }

      for (const e of localData.expenses) {
        const newExpense: Expense = {
          ...e,
          userId,
          vehicleId: vehicleMap.get(e.vehicleId) || e.vehicleId,
        };
        await expenseService.addExpense(newExpense);
        migratedCount++;
      }

      for (const d of localData.documents) {
        const newDoc: DocumentRecord = {
          ...d,
          userId,
          vehicleId: vehicleMap.get(d.vehicleId) || d.vehicleId,
        };
        await documentService.addDocument(newDoc);
        migratedCount++;
      }

      for (const ml of localData.mileageLogs) {
        const newLog: MileageLog = {
          ...ml,
          userId,
          vehicleId: vehicleMap.get(ml.vehicleId) || ml.vehicleId,
        };
        await mileageService.addMileageLog(newLog);
        migratedCount++;
      }

      this.markAsMigrated(userId);
      return { success: true, migratedCount };
    } catch (err: unknown) {
      console.error('Error during data migration to Firestore:', err);
      return {
        success: false,
        migratedCount: 0,
        error: err instanceof Error ? err.message : 'Error durante la migración.',
      };
    }
  },
};
