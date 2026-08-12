import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar, TabType } from './components/navigation/Navbar';
import { Header } from './components/navigation/Header';

// Views
import { DashboardView } from './components/views/DashboardView';
import { MaintenanceView } from './components/views/MaintenanceView';
import { ExpensesView } from './components/views/ExpensesView';
import { DocumentsView } from './components/views/DocumentsView';
import { TipsView } from './components/views/TipsView';
import { HistoryView } from './components/views/HistoryView';
import { VehiclesView } from './components/views/VehiclesView';
import { ProfileView } from './components/views/ProfileView';

// Modals
import { UpdateMileageModal } from './components/modals/UpdateMileageModal';
import { AuthModal } from './components/modals/AuthModal';
import { AddEditMaintenanceModal } from './components/modals/AddEditMaintenanceModal';
import { AddEditExpenseModal } from './components/modals/AddEditExpenseModal';
import { AddEditDocumentModal } from './components/modals/AddEditDocumentModal';
import { AddEditVehicleModal } from './components/modals/AddEditVehicleModal';
import { MaintenancePlanModal } from './components/modals/MaintenancePlanModal';
import { PremiumModal } from './components/modals/PremiumModal';

import { MaintenanceItem, Expense, DocumentRecord, Vehicle } from './types';

export default function App() {
  const { activeTab, setActiveTab } = useApp();

  // Modal visibility states
  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // CRUD Modal states
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceItem | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleOpenAddModal = (
    type: 'maintenance' | 'expense' | 'document' | 'vehicle',
    item?: any
  ) => {
    if (type === 'maintenance') {
      setEditingMaintenance(item || null);
      setIsMaintenanceModalOpen(true);
    } else if (type === 'expense') {
      setEditingExpense(item || null);
      setIsExpenseModalOpen(true);
    } else if (type === 'document') {
      setEditingDocument(item || null);
      setIsDocumentModalOpen(true);
    } else if (type === 'vehicle') {
      setEditingVehicle(item || null);
      setIsVehicleModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <Header
        onOpenAddModal={(type) => handleOpenAddModal(type)}
        onOpenMileageModal={() => setIsMileageModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Bar (Sidebar on desktop, bottom bar on mobile) */}
        <Navbar
          onOpenAddModal={(type) => handleOpenAddModal(type)}
          onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
        />

        {/* Main Workspace Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto">
          {(activeTab === 'home' || activeTab === 'dashboard') && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenAddModal={(type) => handleOpenAddModal(type)}
              onOpenMileageModal={() => setIsMileageModalOpen(true)}
              onOpenPlanModal={() => setIsPlanModalOpen(true)}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              onOpenAddModal={(item) => handleOpenAddModal('maintenance', item)}
              onOpenPlanModal={() => setIsPlanModalOpen(true)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              onOpenAddModal={(item) => handleOpenAddModal('expense', item)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              onOpenAddModal={(item) => handleOpenAddModal('document', item)}
            />
          )}

          {activeTab === 'tips' && <TipsView />}

          {activeTab === 'history' && <HistoryView />}

          {activeTab === 'vehicles' && (
            <VehiclesView
              onOpenAddVehicleModal={(item) => handleOpenAddModal('vehicle', item)}
              onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <UpdateMileageModal
        isOpen={isMileageModalOpen}
        onClose={() => setIsMileageModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <MaintenancePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />

      <AddEditMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setEditingMaintenance(null);
        }}
        initialData={editingMaintenance}
      />

      <AddEditExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />

      <AddEditDocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setEditingDocument(null);
        }}
        initialData={editingDocument}
      />

      <AddEditVehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        initialData={editingVehicle}
      />
    </div>
  );
}
