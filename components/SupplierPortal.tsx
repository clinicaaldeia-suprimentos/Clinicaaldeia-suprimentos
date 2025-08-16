import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';

interface SupplierPortalProps {
    quoteId: string;
    supplierId: string;
    onExit: () => void;
}

const SupplierPortal: React.FC<SupplierPortalProps> = ({ quoteId, supplierId, onExit }) => {
    const { state, dispatch } = useAppContext();
    const [prices, setPrices] = useState<{ [productName: string]: number }>({});
    
    const quote = useMemo(() => state.quotations.find(q => q.id === quoteId), [state.quotations, quoteId]);
    const supplier = useMemo(() => state.suppliers.find(s => s.id === supplierId), [state.suppliers, supplierId]);

    const handlePriceChange = (productName: string, value: string) => {
        const price = parseFloat(value);
        if (!isNaN(price) && price >= 0) {
            setPrices(prev => ({ ...prev, [productName]: price }));
        }
    };
    
    const handleSubmit = () => {
        dispatch({ type: 'SUBMIT_SUPPLIER_QUOTE', payload: { quoteId, supplierId, prices } });
        onExit();
    };

    if (!quote || !supplier) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">Erro: Link de Cotação ou Fornecedor Inválido.</h1>
                <p className="text-gray-600 mt-2">Por favor, verifique o link e tente novamente.</p>
                <Button onClick={onExit} className="mt-4">Voltar</Button>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Portal de Cotação do Fornecedor</h1>
                    <p className="text-gray-600">Bem-vindo, {supplier.name}</p>
                </div>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">Solicitação de Cotação: {quote.title}</h2>
                    <p className="mb-4">Por favor, insira seu preço por unidade para cada item abaixo.</p>
                    
                    <div className="space-y-4">
                        {quote.items.map(item => {
                            return (
                                <div key={item.name} className="grid grid-cols-3 items-center gap-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">Quantidade Solicitada: {item.quantity}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm">R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                onChange={(e) => handlePriceChange(item.name, e.target.value)}
                                                className="block w-full rounded-md border-gray-300 pl-8 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-4">
                        <Button variant="secondary" onClick={onExit}>Sair do Portal</Button>
                        <Button onClick={handleSubmit}>Enviar Cotação</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SupplierPortal;