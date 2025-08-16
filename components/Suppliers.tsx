import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Supplier } from '../types';


export const SupplierForm: React.FC<{ supplier?: Supplier; onSave: (supplier: Supplier) => void; onCancel: () => void }> = ({ supplier, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
        name: supplier?.name || '',
        contactPerson: supplier?.contactPerson || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: supplier?.id || `sup-${Date.now()}`, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pessoa de Contato</label>
                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Salvar Fornecedor</Button>
            </div>
        </form>
    );
}

const Suppliers: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

    const openModal = (supplier?: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setEditingSupplier(undefined);
        setIsModalOpen(false);
    };

    const handleSave = (supplier: Supplier) => {
        if (state.suppliers.some(s => s.id === supplier.id)) {
            dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
        } else {
            dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
        }
        closeModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Fornecedores</h1>
                {currentUser.permissions.canManageSuppliers && (
                    <Button onClick={() => openModal()}>
                        <ion-icon name="add-outline" className="text-xl"></ion-icon>
                        Adicionar Fornecedor
                    </Button>
                )}
            </div>

            <Card>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Empresa</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pessoa de Contato</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {state.suppliers.map(supplier => (
                            <tr key={supplier.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {currentUser.permissions.canManageSuppliers && (
                                        <button onClick={() => openModal(supplier)} className="text-primary-600 hover:text-primary-900">Editar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}>
                <SupplierForm supplier={editingSupplier} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </div>
    );
};

export default Suppliers;