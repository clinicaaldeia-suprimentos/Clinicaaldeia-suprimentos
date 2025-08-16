import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import { POStatus } from '../types';

const CashFlow: React.FC = () => {
    const { state } = useAppContext();

    const cashFlowItems = useMemo(() => {
        return state.purchaseOrders
            .filter(po => po.status === POStatus.APPROVED || po.status === POStatus.DELIVERED)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [state.purchaseOrders]);

    const totalOutflow = useMemo(() => {
        return cashFlowItems.reduce((sum, item) => sum + item.total, 0);
    }, [cashFlowItems]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Fluxo de Caixa</h1>
            </div>

            <Card className="mb-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">Saída Total (OCs Aprovadas e Entregues)</h3>
                    <p className="text-2xl font-bold text-red-600">
                        -{totalOutflow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </Card>

            <Card>
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Histórico de Transações</h2>
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID da OC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cashFlowItems.map(po => {
                             const supplier = state.suppliers.find(s => s.id === po.supplierId);
                            return (
                                <tr key={po.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.createdAt.toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-500 text-right">
                                        -{po.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default CashFlow;