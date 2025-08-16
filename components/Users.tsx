import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import type { User, UserPermissions } from '../types';

const UserForm: React.FC<{ user?: User; onSave: (user: User) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const { state } = useAppContext();
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
        sector: user?.sector || '',
        permissions: user?.permissions || {
            canManageUsers: false,
            canManageSuppliers: false,
            canManageSectors: false,
            canManageRoles: false,
            canCreateQuotations: true,
            canEditQuotations: false,
            canDeleteQuotations: false,
            canCreatePurchaseOrders: false,
            canApprovePOs: false,
            canCancelPOs: false,
            canConfirmDelivery: false,
            canEvaluateSuppliers: false,
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [name]: checked
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: user?.id || `user-${Date.now()}`, ...formData });
    };

    const permissionLabels: { key: keyof UserPermissions, label: string }[] = [
        { key: 'canManageUsers', label: 'Gerenciar Usuários' },
        { key: 'canManageSuppliers', label: 'Gerenciar Fornecedores' },
        { key: 'canManageSectors', label: 'Gerenciar Setores' },
        { key: 'canManageRoles', label: 'Gerenciar Funções' },
        { key: 'canCreateQuotations', label: 'Criar Cotações' },
        { key: 'canEditQuotations', label: 'Editar Cotações' },
        { key: 'canDeleteQuotations', label: 'Excluir Cotações' },
        { key: 'canCreatePurchaseOrders', label: 'Criar Ordens de Compra' },
        { key: 'canApprovePOs', label: 'Aprovar Ordens de Compra' },
        { key: 'canCancelPOs', label: 'Cancelar Ordens de Compra' },
        { key: 'canConfirmDelivery', label: 'Confirmar/Recusar Entrega' },
        { key: 'canEvaluateSuppliers', label: 'Avaliar Fornecedores' },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Função</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
                         <option value="">Selecione uma função</option>
                        {state.roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Setor</label>
                    <select name="sector" value={formData.sector} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required>
                        <option value="">Selecione um setor</option>
                        {state.sectors.map(sector => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-2">Permissões</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 rounded-md border border-gray-200 p-4">
                    {permissionLabels.map(({key, label}) => (
                         <label key={key} className="flex items-center">
                            <input type="checkbox" name={key} checked={formData.permissions[key]} onChange={handlePermissionChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Salvar Usuário</Button>
            </div>
        </form>
    );
}

const Users: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser, users, sectors, roles } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    const openModal = (user?: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setEditingUser(undefined);
        setIsModalOpen(false);
    };

    const handleSave = (user: User) => {
        if (users.some(u => u.id === user.id)) {
            dispatch({ type: 'UPDATE_USER', payload: user });
        } else {
            dispatch({ type: 'ADD_USER', payload: user });
        }
        closeModal();
    };
    
    const getSectorName = (sectorId: string) => sectors.find(s => s.id === sectorId)?.name || 'N/A';
    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'N/A';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
                {currentUser.permissions.canManageUsers && (
                    <Button onClick={() => openModal()}>
                        <ion-icon name="add-outline" className="text-xl"></ion-icon>
                        Adicionar Usuário
                    </Button>
                )}
            </div>
            
            <Card>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{getRoleName(user.role)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{getSectorName(user.sector)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {currentUser.permissions.canManageUsers && (
                                        <button onClick={() => openModal(user)} className="text-primary-600 hover:text-primary-900">Editar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
                <UserForm user={editingUser} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </div>
    );
};

export default Users;