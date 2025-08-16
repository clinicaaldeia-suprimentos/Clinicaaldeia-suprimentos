import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Quotation, QuotationItem, SupplierQuote, Page, QuotationHistoryEntry, Supplier } from '../types';
import { QuotationStatus, POStatus } from '../types';
import { SupplierForm } from './Suppliers';

const QuotationForm: React.FC<{
    quotation?: Quotation;
    onSave: (quoteData: Omit<Quotation, 'id' | 'createdAt' | 'status' | 'history'>, id?: string) => void;
    onCancel: () => void;
    onAddNewSupplier: () => void;
    onEditSupplier: (supplier: Supplier) => void;
}> = ({ quotation, onSave, onCancel, onAddNewSupplier, onEditSupplier }) => {
    const { state } = useAppContext();
    const [title, setTitle] = useState(quotation?.title || '');
    const [items, setItems] = useState<QuotationItem[]>(quotation?.items || []);
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(quotation?.suppliers.map(s => s.supplierId) || []);
    const [currentItem, setCurrentItem] = useState<QuotationItem>({ name: '', quantity: 1 });
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleAddItem = () => {
        if (currentItem.name.trim() && currentItem.quantity > 0 && !items.some(i => i.name.toLowerCase() === currentItem.name.trim().toLowerCase())) {
            setItems([...items, { name: currentItem.name.trim(), quantity: currentItem.quantity }]);
            setCurrentItem({ name: '', quantity: 1 });
        }
    };

    const handleRemoveItem = (name: string) => {
        setItems(items.filter(i => i.name !== name));
    };

    const handleSupplierToggle = (supplierId: string) => {
        setSelectedSuppliers(prev => prev.includes(supplierId) ? prev.filter(id => id !== supplierId) : [...prev, supplierId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const suppliers: SupplierQuote[] = selectedSuppliers.map(id => {
            const existingSupplier = quotation?.suppliers.find(s => s.supplierId === id);
            return existingSupplier ? existingSupplier : { supplierId: id, prices: {}, submitted: false };
        });
        onSave({ title, createdBy: quotation?.createdBy || state.currentUser.id, sector: state.currentUser.sector, items, suppliers }, quotation?.id);
    };

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            { "Nome do Produto": "Ex: Seringa 10ml", "Quantidade": 100 },
            { "Nome do Produto": "Ex: Gaze Estéril (Pacote)", "Quantidade": 50 },
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Itens");
        XLSX.writeFile(workbook, "modelo_itens_cotacao.xlsx");
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                
                const newItems = json.map(row => ({
                    name: String(row['Nome do Produto'] || '').trim(),
                    quantity: Number(row['Quantidade'])
                })).filter(item => item.name && !isNaN(item.quantity) && item.quantity > 0);

                setItems(prev => {
                    const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
                    const uniqueNewItems = newItems.filter(newItem => !existingNames.has(newItem.name.toLowerCase()));
                    return [...prev, ...uniqueNewItems];
                });
            } catch (error) {
                console.error("Erro ao processar o arquivo:", error);
                alert("Ocorreu um erro ao ler a planilha. Verifique se o formato está correto.");
            } finally {
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsArrayBuffer(file);
    };


    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Título da Cotação</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>

            <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Itens para Cotação</h4>
                
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-md border">
                    <Button type="button" variant="secondary" size="sm" onClick={handleDownloadTemplate}>
                        <ion-icon name="download-outline"></ion-icon> Baixar Modelo
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .csv" className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer">
                        <ion-icon name="cloud-upload-outline"></ion-icon> Importar Itens
                    </label>
                </div>

                <div className="flex gap-2">
                    <input type="text" placeholder="Nome do item" value={currentItem.name} onChange={e => setCurrentItem(p => ({ ...p, name: e.target.value }))} className="flex-grow rounded-md border-gray-300" />
                    <input type="number" min="1" placeholder="Qtd." value={currentItem.quantity} onChange={e => setCurrentItem(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} className="w-24 rounded-md border-gray-300" />
                    <Button type="button" variant="secondary" onClick={handleAddItem}>Adicionar</Button>
                </div>

                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {items.map(item => (
                        <div key={item.name} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">Qtd: {item.quantity}</span>
                                <button type="button" onClick={() => handleRemoveItem(item.name)} className="text-red-500 hover:text-red-700">
                                    <ion-icon name="trash-outline"></ion-icon>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800">Selecionar Fornecedores</h4>
                    <Button type="button" variant="secondary" size="sm" onClick={onAddNewSupplier}>
                        <ion-icon name="add-outline"></ion-icon> Adicionar Novo
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {state.suppliers.map(supplier => (
                         <div key={supplier.id} className="flex items-center justify-between p-2 border rounded-md bg-white">
                            <label className="flex items-center cursor-pointer flex-grow">
                                <input type="checkbox" checked={selectedSuppliers.includes(supplier.id)} onChange={() => handleSupplierToggle(supplier.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <span className="ml-2 text-sm text-gray-700">{supplier.name}</span>
                            </label>
                            <button type="button" onClick={() => onEditSupplier(supplier)} className="text-gray-400 hover:text-primary-600 p-1">
                                <ion-icon name="pencil-outline"></ion-icon>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={!title || items.length === 0 || selectedSuppliers.length === 0}>
                    {quotation ? 'Salvar Alterações' : 'Criar Cotação'}
                </Button>
            </div>
        </form>
    )
};

const PriceEntryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (price: number) => void;
    itemName: string;
    supplierName: string;
    currentPrice?: number;
}> = ({ isOpen, onClose, onSave, itemName, supplierName, currentPrice }) => {
    const [price, setPrice] = useState<string>(currentPrice?.toString() || '');

    const handleSave = () => {
        const priceValue = parseFloat(price.replace(',', '.'));
        if (!isNaN(priceValue) && priceValue >= 0) {
            onSave(priceValue);
        } else {
            alert('Por favor, insira um valor numérico válido.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar Preço para ${supplierName}`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item</label>
                    <p className="mt-1 text-md font-semibold text-gray-900">{itemName}</p>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço Unitário (R$)</label>
                    <input
                        type="text"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="0,00"
                        autoFocus
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Preço</Button>
            </div>
        </Modal>
    );
};

const HistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    quote: Quotation | null;
}> = ({ isOpen, onClose, quote }) => {
    const { state } = useAppContext();
    const { users, suppliers } = state;

    const getUserOrSupplierName = (id: string) => {
        const user = users.find(u => u.id === id);
        if (user) return `${user.name} (Usuário)`;
        const supplier = suppliers.find(s => s.id === id);
        if (supplier) return `${supplier.name} (Fornecedor)`;
        return 'Sistema';
    };

    const sortedHistory = useMemo(() =>
        quote ? [...quote.history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) : [],
        [quote]
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Histórico da Cotação: ${quote?.title}`}>
            {quote && (
                <ul className="space-y-4">
                    {sortedHistory.map((entry, index) => (
                        <li key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <ion-icon name="time-outline" className="text-primary-600 text-xl"></ion-icon>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-800">{entry.action}</p>
                                <p className="text-xs text-gray-500">
                                    {entry.timestamp.toLocaleString('pt-BR')} por {getUserOrSupplierName(entry.userId)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
};


interface QuotationsProps {
    setSupplierPortalData: (data: { quoteId: string; supplierId: string } | null) => void;
    setCurrentPage: (page: Page) => void;
}

const Quotations: React.FC<QuotationsProps> = ({ setSupplierPortalData, setCurrentPage }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser, sectors, users, suppliers, settings } = state;
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isPriceEntryModalOpen, setPriceEntryModalOpen] = useState(false);
    const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);

    const [priceEntryInfo, setPriceEntryInfo] = useState<{ quote: Quotation, supplierId: string, itemName: string } | null>(null);
    const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
    const [editingQuote, setEditingQuote] = useState<Quotation | undefined>(undefined);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

    const openFormModal = (quote?: Quotation) => {
        setEditingQuote(quote);
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        setEditingQuote(undefined);
        setFormModalOpen(false);
    };
    
    const openSupplierModal = (supplier?: Supplier) => {
        setEditingSupplier(supplier);
        setSupplierModalOpen(true);
    };

    const handleSaveSupplier = (supplier: Supplier) => {
        if (state.suppliers.some(s => s.id === supplier.id)) {
            dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
        } else {
            dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
        }
        setSupplierModalOpen(false);
    };

    const handleSave = (quoteData: Omit<Quotation, 'id' | 'createdAt' | 'status' | 'history'>, id?: string) => {
        if (id) { // Editing existing quote
            const originalQuote = state.quotations.find(q => q.id === id)!;
            const updatedQuote: Quotation = {
                ...originalQuote,
                ...quoteData,
                 // Don't reset submission status on edit unless it's a draft
                suppliers: quoteData.suppliers.map(s => {
                    const existing = originalQuote.suppliers.find(os => os.supplierId === s.supplierId);
                    return existing ? { ...s, submitted: existing.submitted, prices: existing.prices } : s;
                })
            };
            dispatch({ type: 'UPDATE_QUOTATION', payload: updatedQuote });
        } else { // Creating new quote
            const newQuote: Quotation = {
                id: `quote-${Date.now()}`,
                createdAt: new Date(),
                status: QuotationStatus.DRAFT,
                history: [{ timestamp: new Date(), userId: currentUser.id, action: 'Cotação criada.' }],
                ...quoteData
            };
            dispatch({ type: 'CREATE_QUOTATION', payload: newQuote });
        }
        closeFormModal();
    };

    const openEmailModal = (quote: Quotation) => {
        setSelectedQuote(quote);
        setEmailModalOpen(true);
    };

    const handleConfirmSend = (quoteId: string) => {
        dispatch({ type: 'UPDATE_QUOTATION_STATUS', payload: { id: quoteId, status: QuotationStatus.PENDING, userId: currentUser.id }});
        setEmailModalOpen(false);
        setSelectedQuote(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta cotação?')) {
            dispatch({ type: 'DELETE_QUOTATION', payload: { id } });
        }
    };
    
    const handleViewMap = (quote: Quotation) => {
        setSelectedQuote(quote);
        setMapModalOpen(true);
    };
    
    const openPriceEntry = (quote: Quotation, supplierId: string, itemName: string) => {
        setPriceEntryInfo({ quote, supplierId, itemName });
        setPriceEntryModalOpen(true);
    };

    const handleManualPriceSave = (price: number) => {
        if (priceEntryInfo) {
            dispatch({
                type: 'MANUALLY_UPDATE_SUPPLIER_PRICE',
                payload: {
                    quoteId: priceEntryInfo.quote.id,
                    supplierId: priceEntryInfo.supplierId,
                    productName: priceEntryInfo.itemName,
                    price,
                    userId: currentUser.id
                }
            });
            // Refresh selected quote to reflect changes in the map modal
            const updatedQuote = state.quotations.find(q => q.id === priceEntryInfo.quote.id);
            if(updatedQuote) setSelectedQuote(updatedQuote);
        }
        setPriceEntryModalOpen(false);
        setPriceEntryInfo(null);
    };

    const handleViewHistory = (quote: Quotation) => {
        setSelectedQuote(quote);
        setHistoryModalOpen(true);
    };

    const getBestPrice = (productName: string, suppliers: SupplierQuote[]) => {
        const prices = suppliers
            .map(s => s.prices[productName])
            .filter(p => p !== undefined && p > 0);
        return prices.length > 0 ? Math.min(...prices) : null;
    };
    
    const getSectorName = (sectorId: string) => sectors.find(s => s.id === sectorId)?.name || 'N/A';

    const handleCreatePO = (quote: Quotation, supplierId: string) => {
        const supplierQuote = quote.suppliers.find(s => s.supplierId === supplierId);
        if(!supplierQuote) return;

        const poItems = quote.items.map(item => ({
            productName: item.name,
            quantity: item.quantity,
            price: supplierQuote.prices[item.name] || 0
        }));

        const total = poItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const newPO = {
            id: `po-${Date.now()}`,
            quotationId: quote.id,
            supplierId,
            sector: quote.sector,
            items: poItems,
            total,
            status: POStatus.PENDING_APPROVAL,
            createdAt: new Date()
        };
        dispatch({ type: 'CREATE_PO', payload: { po: newPO, userId: currentUser.id } });
        dispatch({ type: 'UPDATE_QUOTATION_STATUS', payload: { id: quote.id, status: QuotationStatus.CLOSED, userId: currentUser.id }});
        setMapModalOpen(false);
        setCurrentPage('purchase-orders');
    };

    const sortedQuotations = useMemo(() => 
        [...state.quotations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        [state.quotations]
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Cotações</h1>
                {currentUser.permissions.canCreateQuotations && (
                    <Button onClick={() => openFormModal()}>
                        <ion-icon name="add-outline" className="text-xl"></ion-icon>
                        Nova Solicitação de Cotação
                    </Button>
                )}
            </div>
            
            <Card>
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Setor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedQuotations.map(quote => (
                            <tr key={quote.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSectorName(quote.sector)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.createdAt.toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     {quote.status === QuotationStatus.DRAFT && currentUser.permissions.canEditQuotations && (
                                        <Button size="sm" onClick={() => openEmailModal(quote)}>Notificar Fornecedores</Button>
                                     )}
                                     {quote.status === QuotationStatus.COMPLETED && currentUser.permissions.canCreatePurchaseOrders && (
                                        <Button size="sm" onClick={() => handleViewMap(quote)}>Ver Mapa</Button>
                                    )}
                                    <button onClick={() => handleViewHistory(quote)} className="p-1 text-gray-500 hover:text-gray-700" title="Ver Histórico"><ion-icon name="time-outline" className="text-lg"></ion-icon></button>
                                    {currentUser.permissions.canEditQuotations && quote.status !== QuotationStatus.CLOSED && (
                                        <button onClick={() => openFormModal(quote)} className="p-1 text-primary-600 hover:text-primary-800" title="Editar"><ion-icon name="pencil-outline" className="text-lg"></ion-icon></button>
                                    )}
                                    {currentUser.permissions.canDeleteQuotations && quote.status !== QuotationStatus.CLOSED && (
                                        <button onClick={() => handleDelete(quote.id)} className="p-1 text-red-600 hover:text-red-800" title="Excluir"><ion-icon name="trash-outline" className="text-lg"></ion-icon></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={editingQuote ? 'Editar Solicitação de Cotação' : 'Criar Nova Solicitação de Cotação'}>
                <QuotationForm
                    quotation={editingQuote}
                    onSave={handleSave}
                    onCancel={closeFormModal}
                    onAddNewSupplier={() => openSupplierModal()}
                    onEditSupplier={(supplier) => openSupplierModal(supplier)}
                />
            </Modal>
            
             <Modal isOpen={isSupplierModalOpen} onClose={() => setSupplierModalOpen(false)} title={editingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}>
                <SupplierForm
                    supplier={editingSupplier}
                    onSave={handleSaveSupplier}
                    onCancel={() => setSupplierModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEmailModalOpen}
                onClose={() => setEmailModalOpen(false)}
                title="Confirmar Envio para Fornecedores"
                footer={
                    selectedQuote && (
                        <>
                            <Button variant="secondary" onClick={() => setEmailModalOpen(false)}>Cancelar</Button>
                            <Button onClick={() => handleConfirmSend(selectedQuote.id)}>
                                Confirmar Envio e Notificar
                            </Button>
                        </>
                    )
                }
            >
                {selectedQuote && (
                <div>
                    <p className="mb-4">
                        Confirme o envio da solicitação para os fornecedores abaixo. Ao confirmar, o status da cotação será alterado para <strong>"{QuotationStatus.PENDING}"</strong> e os links de resposta serão simulados como enviados.
                    </p>
                    <div className="space-y-4">
                    {selectedQuote.suppliers.map(s => {
                        const supplier = state.suppliers.find(sup => sup.id === s.supplierId);
                        return (
                        <div key={s.supplierId} className="p-4 border rounded-lg bg-gray-50 text-sm">
                            <p><strong>De:</strong> {settings.companyName} &lt;{settings.companyEmail}&gt;</p>
                            <p><strong>Para:</strong> {supplier?.contactPerson} &lt;{supplier?.email}&gt;</p>
                            <p><strong>Assunto:</strong> Solicitação de Cotação: {selectedQuote.title} - {settings.companyName}</p>
                            <div className="mt-2 pt-2 border-t">
                                <p>Olá {supplier?.contactPerson},</p>
                                <p>A empresa {settings.companyName} está solicitando uma cotação para os seguintes itens:</p>
                                <ul className="list-disc pl-5 my-2">
                                    {selectedQuote.items.map(item => {
                                        return <li key={item.name}>{item.name} (Qtd: {item.quantity})</li>
                                    })}
                                </ul>
                                <p>Para enviar seus preços, por favor, clique no link abaixo:</p>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    const currentQuote = state.quotations.find(q => q.id === selectedQuote.id);
                                    if(currentQuote?.status === QuotationStatus.DRAFT) {
                                        alert("Por favor, confirme o envio primeiro para ativar os links de simulação.");
                                        return;
                                    }
                                    setSupplierPortalData({ quoteId: selectedQuote.id, supplierId: s.supplierId });
                                    setCurrentPage('supplier-portal');
                                    setEmailModalOpen(false);
                                }} className="text-primary-600 hover:underline">
                                    Abrir Portal do Fornecedor
                                </a>
                            </div>
                        </div>
                        )
                    })}
                    </div>
                </div>
                )}
            </Modal>
            
             <Modal isOpen={isMapModalOpen} onClose={() => setMapModalOpen(false)} title={`Mapa de Cotação: ${selectedQuote?.title}`}>
                {selectedQuote && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    {selectedQuote.suppliers.map(s => {
                                        const supplier = state.suppliers.find(sup => sup.id === s.supplierId);
                                        return <th key={s.supplierId} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{supplier?.name}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {selectedQuote.items.map(item => {
                                    const bestPrice = getBestPrice(item.name, selectedQuote.suppliers);
                                    return (
                                        <tr key={item.name}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name} (Qtd: {item.quantity})</td>
                                            {selectedQuote.suppliers.map(s => {
                                                const price = s.prices[item.name];
                                                const isBestPrice = price !== undefined && price === bestPrice;
                                                return (
                                                    <td key={s.supplierId} className="px-4 py-4 whitespace-nowrap text-sm text-right cursor-pointer hover:bg-gray-50 group" onClick={() => openPriceEntry(selectedQuote, s.supplierId, item.name)}>
                                                        <div className={`flex justify-end items-center gap-2 ${isBestPrice ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                                            {price !== undefined ? `R$${price.toFixed(2).replace('.',',')}` : <span className="text-gray-400 text-xs">Adicionar</span>}
                                                            {s.submissionType === 'portal' && <span title="Enviado pelo Fornecedor"><ion-icon name="cloud-done-outline"></ion-icon></span>}
                                                            {s.submissionType === 'manual' && <span title={`Adicionado por ${users.find(u => u.id === s.submittedBy)?.name || 'usuário'}`}><ion-icon name="person-circle-outline"></ion-icon></span>}
                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ion-icon name="pencil-outline" className="text-gray-500 text-base"></ion-icon>
                                                            </span>
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                                <tr className="bg-gray-50 font-bold">
                                    <td className="px-4 py-4 text-sm text-gray-900">Total</td>
                                     {selectedQuote.suppliers.map(s => {
                                        const total = selectedQuote.items.reduce((sum, item) => sum + (item.quantity * (s.prices[item.name] || 0)), 0);
                                        return <td key={s.supplierId} className="px-4 py-4 text-right text-sm text-gray-900">{`R$${total.toFixed(2).replace('.',',')}`}</td>
                                    })}
                                </tr>
                               {currentUser.permissions.canCreatePurchaseOrders && (
                                 <tr>
                                    <td className="px-4 py-4"></td>
                                    {selectedQuote.suppliers.map(s => (
                                        <td key={s.supplierId} className="px-4 py-4 text-right">
                                            <Button size="sm" onClick={() => handleCreatePO(selectedQuote, s.supplierId)} disabled={!s.submitted}>Criar OC</Button>
                                        </td>
                                    ))}
                                </tr>
                               )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
            <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} quote={selectedQuote} />
             {priceEntryInfo && (
                <PriceEntryModal
                    isOpen={isPriceEntryModalOpen}
                    onClose={() => setPriceEntryModalOpen(false)}
                    onSave={handleManualPriceSave}
                    itemName={priceEntryInfo.itemName}
                    supplierName={suppliers.find(s => s.id === priceEntryInfo.supplierId)?.name || ''}
                    currentPrice={priceEntryInfo.quote.suppliers.find(s => s.supplierId === priceEntryInfo.supplierId)?.prices[priceEntryInfo.itemName]}
                />
            )}
        </div>
    );
};

export default Quotations;