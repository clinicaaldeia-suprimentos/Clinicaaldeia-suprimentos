import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AppState, Action, User } from '../types';
import { INITIAL_STATE } from '../constants';
import { QuotationStatus, POStatus } from '../types';

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, currentUser: action.payload.user };
        case 'LOGOUT':
            return { ...state, currentUser: null };
        case 'ADD_USER':
            return { ...state, users: [...state.users, action.payload] };
        case 'UPDATE_USER':
            return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
        case 'ADD_SUPPLIER':
            return { ...state, suppliers: [...state.suppliers, action.payload] };
        case 'UPDATE_SUPPLIER':
            return { ...state, suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'ADD_SECTOR':
            return { ...state, sectors: [...state.sectors, action.payload] };
        case 'UPDATE_SECTOR':
            return { ...state, sectors: state.sectors.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_SECTOR':
            // Note: In a real app, we should check if the sector is in use before deleting.
            return { ...state, sectors: state.sectors.filter(s => s.id !== action.payload.id) };
        case 'ADD_ROLE':
            return { ...state, roles: [...state.roles, action.payload] };
        case 'UPDATE_ROLE':
            return { ...state, roles: state.roles.map(r => r.id === action.payload.id ? action.payload : r) };
        case 'DELETE_ROLE':
             // Note: In a real app, we should check if the role is in use before deleting.
            return { ...state, roles: state.roles.filter(r => r.id !== action.payload.id) };
        case 'CREATE_QUOTATION':
            return { ...state, quotations: [...state.quotations, action.payload] };
        case 'UPDATE_QUOTATION':
             return { 
                ...state, 
                quotations: state.quotations.map(q => 
                    q.id === action.payload.id 
                    ? {
                        ...action.payload,
                        history: [
                            ...q.history,
                            { timestamp: new Date(), userId: state.currentUser!.id, action: 'Cotação editada.' }
                        ]
                      }
                    : q
                ) 
            };
        case 'DELETE_QUOTATION': {
            const isPoLinked = state.purchaseOrders.some(po => po.quotationId === action.payload.id);
            if (isPoLinked) {
                alert('Não é possível excluir uma cotação que já possui uma Ordem de Compra associada.');
                return state;
            }
            return { ...state, quotations: state.quotations.filter(q => q.id !== action.payload.id) };
        }
        case 'UPDATE_QUOTATION_STATUS':
             return { 
                ...state, 
                quotations: state.quotations.map(q => 
                    q.id === action.payload.id 
                    ? {
                        ...q, 
                        status: action.payload.status,
                        history: [
                            ...q.history,
                            { timestamp: new Date(), userId: action.payload.userId, action: `Status alterado para "${action.payload.status}".` }
                        ]
                      }
                    : q
                ) 
            };
        case 'SUBMIT_SUPPLIER_QUOTE': {
            const { quoteId, supplierId, prices } = action.payload;
            const supplierName = state.suppliers.find(s => s.id === supplierId)?.name || 'N/A';
            const newQuotations = state.quotations.map(q => {
                if (q.id === quoteId) {
                    const newSuppliers = q.suppliers.map(s => s.supplierId === supplierId ? { ...s, prices, submitted: true, submissionType: 'portal' as const, submittedBy: supplierId } : s);
                    const allSubmitted = newSuppliers.every(s => s.submitted);
                    return { 
                        ...q, 
                        suppliers: newSuppliers, 
                        status: allSubmitted ? QuotationStatus.COMPLETED : q.status,
                        history: [
                            ...q.history,
                            { timestamp: new Date(), userId: supplierId, action: `Fornecedor ${supplierName} enviou os preços.` }
                        ]
                    };
                }
                return q;
            });
            return { ...state, quotations: newQuotations };
        }
        case 'MANUALLY_UPDATE_SUPPLIER_PRICE': {
            const { quoteId, supplierId, productName, price, userId } = action.payload;
            const supplierName = state.suppliers.find(s => s.id === supplierId)?.name || 'N/A';
             const newQuotations = state.quotations.map(q => {
                if (q.id === quoteId) {
                    const oldPrice = q.suppliers.find(s => s.supplierId === supplierId)?.prices[productName];
                    const historyAction = oldPrice !== undefined
                        ? `Preço para "${productName}" do fornecedor ${supplierName} alterado de R$${oldPrice.toFixed(2)} para R$${price.toFixed(2)}.`
                        : `Preço para "${productName}" do fornecedor ${supplierName} adicionado: R$${price.toFixed(2)}.`;

                    const newSuppliers = q.suppliers.map(s => {
                        if (s.supplierId === supplierId) {
                            return {
                                ...s,
                                prices: { ...s.prices, [productName]: price },
                                submitted: true,
                                submissionType: 'manual' as const,
                                submittedBy: userId
                            };
                        }
                        return s;
                    });
                     const allSubmitted = newSuppliers.every(s => s.submitted);
                    return { 
                        ...q, 
                        suppliers: newSuppliers, 
                        status: allSubmitted ? QuotationStatus.COMPLETED : q.status,
                        history: [
                            ...q.history,
                            { timestamp: new Date(), userId: userId, action: historyAction }
                        ]
                    };
                }
                return q;
            });
            return { ...state, quotations: newQuotations };
        }
        case 'CREATE_PO': {
             const { po, userId } = action.payload;
             const newQuotations = state.quotations.map(q => 
                q.id === po.quotationId 
                ? {
                    ...q,
                    history: [
                        ...q.history,
                        { timestamp: new Date(), userId: userId, action: `Ordem de Compra ${po.id} criada.` }
                    ]
                  }
                : q
             );
             return { ...state, purchaseOrders: [...state.purchaseOrders, po], quotations: newQuotations };
        }
        case 'UPDATE_PO_STATUS':
            return { ...state, purchaseOrders: state.purchaseOrders.map(po => po.id === action.payload.id ? {...po, status: action.payload.status} : po) };
        case 'UPDATE_PO_DELIVERY': {
            const { poId, confirmed, observation } = action.payload;
            return {
                ...state,
                purchaseOrders: state.purchaseOrders.map(po =>
                    po.id === poId
                        ? {
                            ...po,
                            status: confirmed ? POStatus.DELIVERED : POStatus.REJECTED,
                            deliveryDetails: {
                                confirmed,
                                observation,
                                date: new Date(),
                            },
                        }
                        : po
                ),
            };
        }
        case 'EVALUATE_SUPPLIER': {
            const { poId, rating, comment } = action.payload;
            return {
                ...state,
                purchaseOrders: state.purchaseOrders.map(po => po.id === poId ? { ...po, evaluation: { rating, comment } } : po)
            };
        }
        case 'UPDATE_SETTINGS': {
            return { ...state, settings: action.payload };
        }
        default:
            return state;
    }
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};