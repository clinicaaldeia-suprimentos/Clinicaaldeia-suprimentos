import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Suppliers from './components/Suppliers';
import Sectors from './components/Sectors';
import Roles from './components/Roles';
import Settings from './components/Settings';
import Quotations from './components/Quotations';
import PurchaseOrders from './components/PurchaseOrders';
import CashFlow from './components/CashFlow';
import SupplierPortal from './components/SupplierPortal';
import Login from './components/Login';
import { AppContextProvider, useAppContext } from './hooks/useAppContext';
import type { Page } from './types';

const AppContent: React.FC = () => {
    const { state } = useAppContext();
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [supplierPortalData, setSupplierPortalData] = useState<{ quoteId: string; supplierId: string } | null>(null);

    if (!state.currentUser) {
        return <Login />;
    }

    const renderPage = () => {
        if (currentPage === 'supplier-portal' && supplierPortalData) {
            return <SupplierPortal quoteId={supplierPortalData.quoteId} supplierId={supplierPortalData.supplierId} onExit={() => setCurrentPage('quotations')} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'users':
                return <Users />;
            case 'suppliers':
                return <Suppliers />;
            case 'sectors':
                return <Sectors />;
            case 'roles':
                return <Roles />;
            case 'settings':
                return <Settings />;
            case 'quotations':
                return <Quotations setSupplierPortalData={setSupplierPortalData} setCurrentPage={setCurrentPage} />;
            case 'purchase-orders':
                return <PurchaseOrders />;
            case 'cash-flow':
                return <CashFlow />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AppContextProvider>
            <AppContent />
        </AppContextProvider>
    );
};

export default App;