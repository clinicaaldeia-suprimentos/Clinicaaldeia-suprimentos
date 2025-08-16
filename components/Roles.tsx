import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Role } from '../types';

const RoleForm: React.FC<{ role?: Role; onSave: (role: Role) => void; onCancel: () => void }> = ({ role, onSave, onCancel }) => {
    const [name, setName] = useState(role?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ id: role?.id || `role-${Date.now()}`, name: name.trim() });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Função</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                />
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Salvar Função</Button>
            </div>
        </form>
    );
};

const Roles: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

    const openModal = (role?: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingRole(undefined);
        setIsModalOpen(false);
    };

    const handleSave = (role: Role) => {
        if (state.roles.some(r => r.id === role.id)) {
            dispatch({ type: 'UPDATE_ROLE', payload: role });
        } else {
            dispatch({ type: 'ADD_ROLE', payload: role });
        }
        closeModal();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.')) {
            dispatch({ type: 'DELETE_ROLE', payload: { id } });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Funções</h1>
                {currentUser.permissions.canManageRoles && (
                    <Button onClick={() => openModal()}>
                        <ion-icon name="add-outline" className="text-xl"></ion-icon>
                        Adicionar Função
                    </Button>
                )}
            </div>
            
            <Card>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Função</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {state.roles.map(role => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                     {currentUser.permissions.canManageRoles && (
                                        <>
                                            <button onClick={() => openModal(role)} className="text-primary-600 hover:text-primary-900">Editar</button>
                                            <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRole ? 'Editar Função' : 'Adicionar Nova Função'}>
                <RoleForm role={editingRole} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </div>
    );
};

export default Roles;