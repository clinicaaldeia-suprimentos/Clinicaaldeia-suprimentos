import React from 'react';
import type { Page } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser, roles } = state;
    // currentUser is guaranteed to be non-null here because Sidebar is only rendered when logged in.
    const currentUserRoleName = roles.find(r => r.id === currentUser!.role)?.name || 'N/A';

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    const navItems = [
        { id: 'dashboard', label: 'Painel', icon: 'grid-outline', requiredPermission: true },
        { id: 'users', label: 'Usuários', icon: 'people-outline', requiredPermission: currentUser!.permissions.canManageUsers },
        { id: 'suppliers', label: 'Fornecedores', icon: 'boat-outline', requiredPermission: currentUser!.permissions.canManageSuppliers },
        { id: 'sectors', label: 'Setores', icon: 'business-outline', requiredPermission: currentUser!.permissions.canManageSectors },
        { id: 'roles', label: 'Funções', icon: 'key-outline', requiredPermission: currentUser!.permissions.canManageRoles },
        { id: 'settings', label: 'Configurações', icon: 'settings-outline', requiredPermission: currentUser!.permissions.canManageUsers },
        { id: 'quotations', label: 'Cotações', icon: 'document-text-outline', requiredPermission: currentUser!.permissions.canCreateQuotations },
        { id: 'purchase-orders', label: 'Ordens de Compra', icon: 'receipt-outline', requiredPermission: true },
        { id: 'cash-flow', label: 'Fluxo de Caixa', icon: 'cash-outline', requiredPermission: true },
    ] as const;

    const NavLink: React.FC<{ id: Page, label: string, icon: string }> = ({ id, label, icon }) => (
        <li className="my-1">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentPage(id); }}
                className={`flex items-center p-3 rounded-lg transition-colors text-gray-200 hover:bg-primary-700 ${currentPage === id ? 'bg-primary-700 font-semibold' : ''}`}
            >
                <ion-icon name={icon} className="text-2xl mr-4"></ion-icon>
                <span className="text-sm">{label}</span>
            </a>
        </li>
    );

    return (
        <aside className="w-64 bg-primary-900 text-white flex flex-col">
            <div className="p-6 flex items-center space-x-3 border-b border-primary-800">
                <ion-icon name="pulse-outline" className="text-4xl text-white"></ion-icon>
                <h1 className="text-xl font-bold tracking-tight">ClinicSupply</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul>
                    {navItems.filter(item => item.requiredPermission).map(item => <NavLink key={item.id} id={item.id as Page} label={item.label} icon={item.icon} />)}
                </ul>
            </nav>
            <div className="p-4 border-t border-primary-800">
                 <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg transition-colors text-gray-200 hover:bg-primary-700 mb-4"
                >
                    <ion-icon name="log-out-outline" className="text-2xl mr-4"></ion-icon>
                    <span className="text-sm">Sair</span>
                </button>
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src="https://picsum.photos/100" alt="Avatar do Usuário" />
                    <div className="ml-3">
                        <p className="text-sm font-semibold">{currentUser!.name}</p>
                        <p className="text-xs text-primary-300">{currentUserRoleName}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;