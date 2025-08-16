import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import { POStatus, QuotationStatus } from '../types';

const Dashboard: React.FC = () => {
    const { state } = useAppContext();
    const { purchaseOrders, quotations, sectors } = state;

    const totalSpending = purchaseOrders
        .filter(po => po.status === POStatus.APPROVED || po.status === POStatus.DELIVERED)
        .reduce((sum, po) => sum + po.total, 0);

    const openPOs = purchaseOrders.filter(po => po.status === POStatus.APPROVED).length;
    const pendingQuotes = quotations.filter(q => q.status !== QuotationStatus.CLOSED && q.status !== QuotationStatus.COMPLETED).length;

    const spendingBySector = sectors.map(sector => ({
        name: sector.name,
        spending: purchaseOrders
            .filter(po => po.sector === sector.id && (po.status === POStatus.APPROVED || po.status === POStatus.DELIVERED))
            .reduce((sum, po) => sum + po.total, 0)
    })).filter(d => d.spending > 0);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-primary-600 text-white">
                    <div className="flex items-center">
                        <ion-icon name="wallet-outline" className="text-4xl mr-4"></ion-icon>
                        <div>
                            <div className="text-sm font-medium opacity-80">Despesa Total</div>
                            <div className="text-3xl font-bold">
                                {totalSpending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </div>
                    </div>
                </Card>
                 <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                    <div className="flex items-center">
                        <ion-icon name="receipt-outline" className="text-4xl mr-4"></ion-icon>
                        <div>
                            <div className="text-sm font-medium opacity-80">Ordens de Compra Abertas</div>
                            <div className="text-3xl font-bold">{openPOs}</div>
                        </div>
                    </div>
                </Card>
                 <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                    <div className="flex items-center">
                        <ion-icon name="document-text-outline" className="text-4xl mr-4"></ion-icon>
                        <div>
                            <div className="text-sm font-medium opacity-80">Cotações Pendentes</div>
                            <div className="text-3xl font-bold">{pendingQuotes}</div>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    <div className="flex items-center">
                       <ion-icon name="people-outline" className="text-4xl mr-4"></ion-icon>
                        <div>
                            <div className="text-sm font-medium opacity-80">Fornecedores Ativos</div>
                            <div className="text-3xl font-bold">{state.suppliers.length}</div>
                        </div>
                    </div>
                </Card>
            </div>
            
            <Card title="Despesas por Setor">
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={spendingBySector} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `R$${Number(value).toLocaleString('pt-BR')}`} />
                            <Tooltip formatter={(value: number) => `R$${value.toLocaleString('pt-BR')}`} />
                            <Legend />
                            <Bar dataKey="spending" fill="#3b82f6" name="Despesa Total" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;