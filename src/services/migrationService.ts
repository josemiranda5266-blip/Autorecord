import { doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
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
    userIdParam: string,
    localData: LocalDataToMigrate
  ): Promise<{ success: boolean; migratedCount: number; error?: string }> {
    if (!db) {
      return { success: false, migratedCount: 0, error: 'Firestore no está inicializado.' };
    }

    // Always enforce current authenticated Firebase Auth UID over any LocalStorage string
    const currentAuthUid = auth?.currentUser?.uid;
    const targetUserId = currentAuthUid || userIdParam;

    if (!targetUserId) {
      return { success: false, migratedCount: 0, error: 'Usuario no autenticado.' };
    }

    if (this.hasBeenMigrated(targetUserId)) {
      return { success: true, migratedCount: 0 };
    }

    try {
      let migratedCount = 0;
      const batchLimit = 400; // Safe threshold below Firestore 500 limit
      let currentBatch = writeBatch(db);
      let batchOpCount = 0;

      const commitBatchIfNeeded = async (force = false) => {
        if (batchOpCount > 0 && (batchOpCount >= batchLimit || force)) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          batchOpCount = 0;
        }
      };

      // 1. Migrate vehicles using original IDs for idempotency
      for (const v of localData.vehicles) {
        if (!v.id) continue;
        const vehicleDocRef = doc(db, 'vehicles', v.id);
        const { id, ...vData } = v;
        currentBatch.set(
          vehicleDocRef,
          {
            ...vData,
            id: v.id,
            userId: targetUserId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        batchOpCount++;
        migratedCount++;
        await commitBatchIfNeeded();
      }

      // 2. Migrate maintenances
      for (const m of localData.maintenances) {
        if (!m.id || !m.vehicleId) continue;
        const maintDocRef = doc(db, 'maintenance', m.id);
        const { id, ...mData } = m;
        currentBatch.set(
          maintDocRef,
          {
            ...mData,
            id: m.id,
            userId: targetUserId,
          },
          { merge: true }
        );
        batchOpCount++;
        migratedCount++;
        await commitBatchIfNeeded();
      }

      // 3. Migrate expenses
      for (const e of localData.expenses) {
        if (!e.id || !e.vehicleId) continue;
        const expDocRef = doc(db, 'expenses', e.id);
        const { id, ...eData } = e;
        currentBatch.set(
          expDocRef,
          {
            ...eData,
            id: e.id,
            userId: targetUserId,
          },
          { merge: true }
        );
        batchOpCount++;
        migratedCount++;
        await commitBatchIfNeeded();
      }

      // 4. Migrate documents
      for (const d of localData.documents) {
        if (!d.id || !d.vehicleId) continue;
        const docRef = doc(db, 'documents', d.id);
        const { id, ...dData } = d;
        currentBatch.set(
          docRef,
          {
            ...dData,
            id: d.id,
            userId: targetUserId,
          },
          { merge: true }
        );
        batchOpCount++;
        migratedCount++;
        await commitBatchIfNeeded();
      }

      // 5. Migrate mileage logs
      for (const ml of localData.mileageLogs) {
        if (!ml.id || !ml.vehicleId) continue;
        const logDocRef = doc(db, 'mileage', ml.id);
        const { id, ...mlData } = ml;
        currentBatch.set(
          logDocRef,
          {
            ...mlData,
            id: ml.id,
            userId: targetUserId,
          },
          { merge: true }
        );
        batchOpCount++;
        migratedCount++;
        await commitBatchIfNeeded();
      }

      // Commit any remaining operations
      await commitBatchIfNeeded(true);

      this.markAsMigrated(targetUserId);
      return { success: true, migratedCount };
    } catch (err: unknown) {
      console.error('Error durante la migración atómica a Firestore:', err);
      return {
        success: false,
        migratedCount: 0,
        error: err instanceof Error ? err.message : 'Error durante la migración.',
      };
    }
  },
};

