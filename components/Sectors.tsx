import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Sector } from '../types';

const SectorForm: React.FC<{ sector?: Sector; onSave: (sector: Sector) => void; onCancel: () => void }> = ({ sector, onSave, onCancel }) => {
    const [name, setName] = useState(sector?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ id: sector?.id || `sec-${Date.now()}`, name: name.trim() });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Setor</label>
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
                <Button type="submit">Salvar Setor</Button>
            </div>
        </form>
    );
};

const Sectors: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<Sector | undefined>(undefined);

    const openModal = (sector?: Sector) => {
        setEditingSector(sector);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingSector(undefined);
        setIsModalOpen(false);
    };

    const handleSave = (sector: Sector) => {
        if (state.sectors.some(s => s.id === sector.id)) {
            dispatch({ type: 'UPDATE_SECTOR', payload: sector });
        } else {
            dispatch({ type: 'ADD_SECTOR', payload: sector });
        }
        closeModal();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.')) {
            dispatch({ type: 'DELETE_SECTOR', payload: { id } });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Setores</h1>
                {currentUser.permissions.canManageSectors && (
                    <Button onClick={() => openModal()}>
                        <ion-icon name="add-outline" className="text-xl"></ion-icon>
                        Adicionar Setor
                    </Button>
                )}
            </div>
            
            <Card>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Setor</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {state.sectors.map(sector => (
                            <tr key={sector.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sector.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    {currentUser.permissions.canManageSectors && (
                                        <>
                                            <button onClick={() => openModal(sector)} className="text-primary-600 hover:text-primary-900">Editar</button>
                                            <button onClick={() => handleDelete(sector.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSector ? 'Editar Setor' : 'Adicionar Novo Setor'}>
                <SectorForm sector={editingSector} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </div>
    );
};

export default Sectors;