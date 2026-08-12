import { doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Vehicle, MaintenanceItem, Expense, DocumentRecord, MileageLog, Reminder } from '../types';

const MIGRATION_FLAG_KEY = 'autorecord_migrated_uid_';

export interface LocalDataToMigrate {
  vehicles: Vehicle[];
  maintenances: MaintenanceItem[];
  expenses: Expense[];
  documents: DocumentRecord[];
  mileageLogs: MileageLog[];
  reminders?: Reminder[];
}

export const migrationService = {
  hasBeenMigrated(userId: string): boolean {
    return localStorage.getItem(MIGRATION_FLAG_KEY + userId) === 'true';
  },

  markAsMigrated(userId: string): void {
    localStorage.setItem(MIGRATION_FLAG_KEY + userId, 'true');
  },

  async migrateLocalDataToFirestore(
    localData: LocalDataToMigrate
  ): Promise<{ success: boolean; migratedCount: number; error?: string }> {
    if (!db) {
      return { success: false, migratedCount: 0, error: 'Firestore no está inicializado.' };
    }

    // La fuente de verdad del ownership es exclusivamente el UID del usuario autenticado en Firebase Auth
    const targetUserId = auth?.currentUser?.uid;

    if (!targetUserId) {
      return {
        success: false,
        migratedCount: 0,
        error: 'Usuario no autenticado.',
      };
    }

    if (this.hasBeenMigrated(targetUserId)) {
      return { success: true, migratedCount: 0 };
    }

    // Proceso de migración idempotente con atomicidad por batch (fragmentos de hasta 400 escrituras por batch).
    // Nota: Cada batch es atómico individualmente; la idempotencia por ID permite reintentar si un batch falla sin duplicar registros.
    try {
      let migratedCount = 0;
      const batchLimit = 400; // Límite seguro por debajo del máximo de 500 escrituras por batch de Firestore
      let currentBatch = writeBatch(db);
      let batchOpCount = 0;

      const commitBatchIfNeeded = async (force = false) => {
        if (batchOpCount > 0 && (batchOpCount >= batchLimit || force)) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          batchOpCount = 0;
        }
      };

      // 1. Migrar vehículos conservando el ID original para idempotencia y forzando targetUserId
      for (const v of localData.vehicles) {
        if (!v.id) continue;
        const vehicleDocRef = doc(db, 'vehicles', v.id);
        const { id, userId, ...vData } = v;
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

      // 2. Migrar mantenimientos conservando ID original y vehicleId, forzando targetUserId
      for (const m of localData.maintenances) {
        if (!m.id || !m.vehicleId) continue;
        const maintDocRef = doc(db, 'maintenance', m.id);
        const { id, userId, ...mData } = m;
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

      // 3. Migrar gastos conservando ID original y vehicleId, forzando targetUserId
      for (const e of localData.expenses) {
        if (!e.id || !e.vehicleId) continue;
        const expDocRef = doc(db, 'expenses', e.id);
        const { id, userId, ...eData } = e;
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

      // 4. Migrar documentos conservando ID original y vehicleId, forzando targetUserId
      for (const d of localData.documents) {
        if (!d.id || !d.vehicleId) continue;
        const docRef = doc(db, 'documents', d.id);
        const { id, userId, ...dData } = d;
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

      // 5. Migrar registros de kilometraje conservando ID original y vehicleId, forzando targetUserId
      for (const ml of localData.mileageLogs) {
        if (!ml.id || !ml.vehicleId) continue;
        const logDocRef = doc(db, 'mileage', ml.id);
        const { id, userId, ...mlData } = ml;
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

      // 6. Migrar recordatorios conservando ID original y vehicleId, forzando targetUserId
      if (localData.reminders) {
        for (const r of localData.reminders) {
          if (!r.id || !r.vehicleId) continue;
          const remDocRef = doc(db, 'reminders', r.id);
          const { id, userId, ...rData } = r;
          currentBatch.set(
            remDocRef,
            {
              ...rData,
              id: r.id,
              userId: targetUserId,
            },
            { merge: true }
          );
          batchOpCount++;
          migratedCount++;
          await commitBatchIfNeeded();
        }
      }

      // Confirmar el último batch pendiente
      await commitBatchIfNeeded(true);

      // Si todos los batches fueron confirmados con éxito, marcar como migrado
      this.markAsMigrated(targetUserId);
      return { success: true, migratedCount };
    } catch (err: unknown) {
      console.error('Error durante la migración por batches a Firestore:', err);
      // No se marca como migrado para permitir que una ejecución subsiguiente complete los batches restantes idempotentemente
      return {
        success: false,
        migratedCount: 0,
        error: err instanceof Error ? err.message : 'Error durante la migración por batches.',
      };
    }
  },
};

