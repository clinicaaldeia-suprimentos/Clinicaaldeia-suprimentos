import type { AppState, Sector, Role } from './types';
import { QuotationStatus, POStatus } from './types';

export const ALL_PO_STATUSES = Object.values(POStatus);

export const mockSectors: Sector[] = [
    { id: 'sec-1', name: 'Cardiologia' },
    { id: 'sec-2', name: 'Ortopedia' },
    { id: 'sec-3', name: 'Farmácia' },
    { id: 'sec-4', name: 'Geral' },
    { id: 'sec-5', name: 'Administração' },
];

export const mockRoles: Role[] = [
    { id: 'role-1', name: 'Administrador' },
    { id: 'role-2', name: 'Gerente' },
    { id: 'role-3', name: 'Funcionário' },
];

const adminPermissions = {
    canManageUsers: true,
    canManageSuppliers: true,
    canManageSectors: true,
    canManageRoles: true,
    canCreateQuotations: true,
    canEditQuotations: true,
    canDeleteQuotations: true,
    canCreatePurchaseOrders: true,
    canApprovePOs: true,
    canCancelPOs: true,
    canConfirmDelivery: true,
    canEvaluateSuppliers: true,
};

const managerPermissions = {
    canManageUsers: false,
    canManageSuppliers: true,
    canManageSectors: false,
    canManageRoles: false,
    canCreateQuotations: true,
    canEditQuotations: true,
    canDeleteQuotations: false,
    canCreatePurchaseOrders: true,
    canApprovePOs: true,
    canCancelPOs: true,
    canConfirmDelivery: true,
    canEvaluateSuppliers: true,
};

const staffPermissions = {
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
    canConfirmDelivery: true,
    canEvaluateSuppliers: true,
};


export const INITIAL_STATE: AppState = {
    currentUser: null,
    users: [
        { id: 'user-1', name: 'Dra. Alice', email: 'alice@clinic.com', password: '123', role: 'role-1', sector: 'sec-5', permissions: adminPermissions },
        { id: 'user-2', name: 'Beto Gerente', email: 'beto@clinic.com', password: '123', role: 'role-2', sector: 'sec-3', permissions: managerPermissions },
        { id: 'user-3', name: 'Carlos Funcionário', email: 'carlos@clinic.com', password: '123', role: 'role-3', sector: 'sec-1', permissions: staffPermissions },
        { id: 'user-4', name: 'Diana Funcionária', email: 'diana@clinic.com', password: '123', role: 'role-3', sector: 'sec-2', permissions: staffPermissions },
    ],
    suppliers: [
        { id: 'sup-1', name: 'Fornecedora Médica Cia.', contactPerson: 'João da Silva', email: 'joao.silva@medsupplies.com', phone: '555-1234' },
        { id: 'sup-2', name: 'Soluções Farmacêuticas', contactPerson: 'Joana Silva', email: 'joana.silva@pharmasol.com', phone: '555-5678' },
        { id: 'sup-3', name: 'Mundo dos Equipamentos', contactPerson: 'Pedro Soares', email: 'pedro.soares@equipworld.com', phone: '555-9012' },
    ],
    sectors: mockSectors,
    roles: mockRoles,
    quotations: [
        {
            id: 'quote-1',
            title: 'Solicitação de Suprimentos T1',
            createdBy: 'user-2',
            sector: 'sec-3', // Pharmacy ID
            status: QuotationStatus.COMPLETED,
            createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
            items: [
                { name: 'Ibuprofeno 200mg (Frasco)', quantity: 10 },
                { name: 'Solução Salina 500ml', quantity: 20 },
            ],
            suppliers: [
                { supplierId: 'sup-1', prices: { 'Ibuprofeno 200mg (Frasco)': 15.50, 'Solução Salina 500ml': 8.00 }, submitted: true, submissionType: 'portal' },
                { supplierId: 'sup-2', prices: { 'Ibuprofeno 200mg (Frasco)': 14.99, 'Solução Salina 500ml': 8.25 }, submitted: true, submissionType: 'portal' },
            ],
            history: [
                { timestamp: new Date(new Date().setDate(new Date().getDate() - 10)), userId: 'user-2', action: 'Cotação criada.' },
                { timestamp: new Date(new Date().setDate(new Date().getDate() - 9)), userId: 'sup-1', action: 'Fornecedor Fornecedora Médica Cia. enviou os preços.' },
                { timestamp: new Date(new Date().setDate(new Date().getDate() - 9)), userId: 'sup-2', action: 'Fornecedor Soluções Farmacêuticas enviou os preços.' },
            ]
        }
    ],
    purchaseOrders: [
        {
            id: 'po-1',
            quotationId: 'quote-1',
            supplierId: 'sup-2',
            sector: 'sec-3', // Pharmacy ID
            items: [
                { productName: 'Ibuprofeno 200mg (Frasco)', quantity: 10, price: 14.99 },
                { productName: 'Solução Salina 500ml', quantity: 20, price: 8.25 },
            ],
            total: (10 * 14.99) + (20 * 8.25),
            status: POStatus.DELIVERED,
            createdAt: new Date(new Date().setDate(new Date().getDate() - 9)),
            evaluation: {
                rating: 5,
                comment: 'Entrega rápida e produtos de boa qualidade.'
            },
            deliveryDetails: {
                confirmed: true,
                observation: 'Recebido conforme o pedido.',
                date: new Date(new Date().setDate(new Date().getDate() - 8))
            }
        }
    ],
    settings: {
        companyName: 'ClinicSupply - Matriz',
        companyEmail: 'compras@clinic.com'
    }
};