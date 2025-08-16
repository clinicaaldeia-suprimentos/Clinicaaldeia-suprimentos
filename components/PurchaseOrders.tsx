import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Modal from './common/Modal';
import Button from './common/Button';
import type { PurchaseOrder } from '../types';
import { POStatus } from '../types';

const POStatusBadge: React.FC<{ status: POStatus }> = ({ status }) => {
    const colorMap = {
        [POStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
        [POStatus.APPROVED]: 'bg-blue-100 text-blue-800',
        [POStatus.DELIVERED]: 'bg-green-100 text-green-800',
        [POStatus.REJECTED]: 'bg-gray-100 text-gray-800',
        [POStatus.CANCELED]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status]}`}>{status}</span>;
}

const EvaluationForm: React.FC<{ po: PurchaseOrder; onSave: (poId: string, rating: number, comment: string) => void; onCancel: () => void }> = ({ po, onSave, onCancel }) => {
    const [rating, setRating] = useState(po.evaluation?.rating || 0);
    const [comment, setComment] = useState(po.evaluation?.comment || '');

    return (
        <div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação</label>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(star)} className="text-3xl text-gray-300 hover:text-yellow-400">
                            <ion-icon name={rating >= star ? 'star' : 'star-outline'} className={rating >= star ? 'text-yellow-400' : ''}></ion-icon>
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comentários / Reclamações</label>
                <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button onClick={() => onSave(po.id, rating, comment)}>Enviar Avaliação</Button>
            </div>
        </div>
    );
};

const DeliveryConfirmationModal: React.FC<{
    po: PurchaseOrder;
    isConfirm: boolean;
    onSave: (poId: string, confirmed: boolean, observation: string) => void;
    onCancel: () => void;
}> = ({ po, isConfirm, onSave, onCancel }) => {
    const [observation, setObservation] = useState('');

    const handleSubmit = () => {
        onSave(po.id, isConfirm, observation);
    };

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="observation" className="block text-sm font-medium text-gray-700">
                    Observação da Entrega {isConfirm ? '(Opcional)' : '(Obrigatório)'}
                </label>
                <textarea
                    id="observation"
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required={!isConfirm}
                />
            </div>
            <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={!isConfirm && !observation.trim()}>
                    {isConfirm ? 'Confirmar Entrega' : 'Recusar Entrega'}
                </Button>
            </div>
        </div>
    );
};


const PurchaseOrders: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser, sectors } = state;
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isEvalModalOpen, setEvalModalOpen] = useState(false);
    const [isDeliveryModalOpen, setDeliveryModalOpen] = useState(false);
    const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(true);

    const openDetailModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setDetailModalOpen(true);
    };
    const openEvalModal = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setEvalModalOpen(true);
    };
    
    const openDeliveryModal = (po: PurchaseOrder, confirm: boolean) => {
        setSelectedPO(po);
        setIsConfirmingDelivery(confirm);
        setDeliveryModalOpen(true);
    };

    const handleUpdateStatus = (id: string, status: POStatus) => {
        if (status === POStatus.CANCELED) {
            if (!window.confirm('Tem certeza que deseja cancelar esta Ordem de Compra?')) {
                return;
            }
        }
        dispatch({ type: 'UPDATE_PO_STATUS', payload: { id, status } });
    };

    const handleSaveEvaluation = (poId: string, rating: number, comment: string) => {
        dispatch({ type: 'EVALUATE_SUPPLIER', payload: { poId, rating, comment } });
        setEvalModalOpen(false);
    };
    
    const handleSaveDelivery = (poId: string, confirmed: boolean, observation: string) => {
        dispatch({ type: 'UPDATE_PO_DELIVERY', payload: { poId, confirmed, observation } });
        setDeliveryModalOpen(false);
    };
    
    const getSectorName = (sectorId: string) => sectors.find(s => s.id === sectorId)?.name || 'N/A';

    const sortedPOs = useMemo(() =>
        [...state.purchaseOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        [state.purchaseOrders]
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Ordens de Compra</h1>
            <Card>
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID da OC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Setor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPOs.map(po => {
                            const supplier = state.suppliers.find(s => s.id === po.supplierId);
                            const canBeCanceled = po.status === POStatus.PENDING_APPROVAL || po.status === POStatus.APPROVED;
                            return (
                                <tr key={po.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 cursor-pointer" onClick={() => openDetailModal(po)}>{po.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSectorName(po.sector)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{po.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.createdAt.toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><POStatusBadge status={po.status}/></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {po.status === POStatus.PENDING_APPROVAL && currentUser.permissions.canApprovePOs && (
                                            <Button size="sm" onClick={() => handleUpdateStatus(po.id, POStatus.APPROVED)}>Aprovar</Button>
                                        )}
                                        {po.status === POStatus.APPROVED && currentUser.permissions.canConfirmDelivery && (
                                            <>
                                            <Button size="sm" variant="secondary" onClick={() => openDeliveryModal(po, false)}>Recusar Entrega</Button>
                                            <Button size="sm" onClick={() => openDeliveryModal(po, true)}>Confirmar Entrega</Button>
                                            </>
                                        )}
                                        {po.status === POStatus.DELIVERED && currentUser.permissions.canEvaluateSuppliers && (
                                            <Button size="sm" variant="secondary" onClick={() => openEvalModal(po)}>
                                                {po.evaluation ? 'Ver Avaliação' : 'Avaliar'}
                                            </Button>
                                        )}
                                        {canBeCanceled && currentUser.permissions.canCancelPOs && (
                                            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(po.id, POStatus.CANCELED)}>Cancelar</Button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalhes da Ordem de Compra: ${selectedPO?.id}`}>
                {selectedPO && (
                    <div>
                        <p><strong>Fornecedor:</strong> {state.suppliers.find(s=>s.id === selectedPO.supplierId)?.name}</p>
                        <p><strong>Total:</strong> {selectedPO.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p><strong>Status:</strong> {selectedPO.status}</p>
                        {selectedPO.deliveryDetails && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                <h4 className="font-semibold text-sm">Detalhes da Entrega:</h4>
                                <p className="text-sm text-gray-600"><strong>Data:</strong> {selectedPO.deliveryDetails.date.toLocaleString('pt-BR')}</p>
                                <p className="text-sm text-gray-600"><strong>Observação:</strong> {selectedPO.deliveryDetails.observation || 'Nenhuma'}</p>
                            </div>
                        )}
                        <h4 className="font-semibold mt-4 mb-2">Itens:</h4>
                        <ul className="divide-y divide-gray-200">
                            {selectedPO.items.map(item => (
                                <li key={item.productName} className="flex justify-between py-2">
                                    <span>{item.productName} (x{item.quantity})</span>
                                    <span>{(item.quantity * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
             <Modal isOpen={isEvalModalOpen} onClose={() => setEvalModalOpen(false)} title={`Avaliar Fornecedor para OC: ${selectedPO?.id}`}>
                {selectedPO && <EvaluationForm po={selectedPO} onSave={handleSaveEvaluation} onCancel={() => setEvalModalOpen(false)}/>}
            </Modal>
            <Modal
                isOpen={isDeliveryModalOpen}
                onClose={() => setDeliveryModalOpen(false)}
                title={isConfirmingDelivery ? 'Confirmar Recebimento de Entrega' : 'Recusar Entrega'}
            >
                {selectedPO && (
                    <DeliveryConfirmationModal
                        po={selectedPO}
                        isConfirm={isConfirmingDelivery}
                        onSave={handleSaveDelivery}
                        onCancel={() => setDeliveryModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PurchaseOrders;