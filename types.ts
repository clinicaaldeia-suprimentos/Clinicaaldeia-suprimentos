export interface Role {
    id: string;
    name: string;
}

export interface Sector {
    id:string;
    name: string;
}

export interface UserPermissions {
    canManageUsers: boolean;
    canManageSuppliers: boolean;
    canManageSectors: boolean;
    canManageRoles: boolean;
    canCreateQuotations: boolean;
    canEditQuotations: boolean;
    canDeleteQuotations: boolean;
    canCreatePurchaseOrders: boolean;
    canApprovePOs: boolean;
    canCancelPOs: boolean;
    canConfirmDelivery: boolean;
    canEvaluateSuppliers: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: string; // Role ID
    sector: string; // Sector ID
    permissions: UserPermissions;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
}

export interface QuotationItem {
    name: string;
    quantity: number;
}

export interface SupplierQuote {
    supplierId: string;
    prices: { [productName: string]: number };
    submitted: boolean;
    submissionType?: 'portal' | 'manual';
    submittedBy?: string; // userId for manual, supplierId for portal
}

export enum QuotationStatus {
    DRAFT = 'Rascunho',
    PENDING = 'Aguardando Fornecedor',
    COMPLETED = 'Concluída',
    CLOSED = 'Fechada',
}

export interface QuotationHistoryEntry {
    timestamp: Date;
    userId: string;
    action: string;
}

export interface Quotation {
    id: string;
    title: string;
    createdBy: string; // userId
    sector: string; // Sector ID
    status: QuotationStatus;
    items: QuotationItem[];
    suppliers: SupplierQuote[];
    createdAt: Date;
    history: QuotationHistoryEntry[];
}

export enum POStatus {
    PENDING_APPROVAL = 'Pendente Aprovação',
    APPROVED = 'Aprovada',
    DELIVERED = 'Entregue',
    REJECTED = 'Recusada',
    CANCELED = 'Cancelada',
}

export interface PurchaseOrder {
    id: string;
    quotationId: string;
    supplierId: string;
    sector: string; // Sector ID
    items: { productName: string; quantity: number; price: number }[];
    total: number;
    status: POStatus;
    createdAt: Date;
    evaluation?: {
        rating: number; // 1-5
        comment: string;
    };
    deliveryDetails?: {
        confirmed: boolean;
        observation: string;
        date: Date;
    }
}

export type Page = 'dashboard' | 'users' | 'suppliers' | 'sectors' | 'roles' | 'quotations' | 'purchase-orders' | 'cash-flow' | 'supplier-portal' | 'settings';

export interface Settings {
    companyName: string;
    companyEmail: string;
}

export interface AppState {
    users: User[];
    suppliers: Supplier[];
    quotations: Quotation[];
    purchaseOrders: PurchaseOrder[];
    sectors: Sector[];
    roles: Role[];
    currentUser: User | null;
    settings: Settings;
}

export type Action =
    | { type: 'LOGIN'; payload: { user: User } }
    | { type: 'LOGOUT' }
    | { type: 'ADD_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'ADD_SUPPLIER'; payload: Supplier }
    | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
    | { type: 'ADD_SECTOR'; payload: Sector }
    | { type: 'UPDATE_SECTOR'; payload: Sector }
    | { type: 'DELETE_SECTOR'; payload: { id: string } }
    | { type: 'ADD_ROLE'; payload: Role }
    | { type: 'UPDATE_ROLE'; payload: Role }
    | { type: 'DELETE_ROLE'; payload: { id: string } }
    | { type: 'CREATE_QUOTATION'; payload: Quotation }
    | { type: 'UPDATE_QUOTATION'; payload: Quotation }
    | { type: 'DELETE_QUOTATION'; payload: { id: string } }
    | { type: 'UPDATE_QUOTATION_STATUS'; payload: { id: string; status: QuotationStatus; userId: string } }
    | { type: 'SUBMIT_SUPPLIER_QUOTE'; payload: { quoteId: string; supplierId: string; prices: { [productName: string]: number } } }
    | { type: 'MANUALLY_UPDATE_SUPPLIER_PRICE', payload: { quoteId: string; supplierId: string; productName: string; price: number; userId: string } }
    | { type: 'CREATE_PO'; payload: { po: PurchaseOrder; userId: string } }
    | { type: 'UPDATE_PO_STATUS'; payload: { id: string; status: POStatus } }
    | { type: 'UPDATE_PO_DELIVERY'; payload: { poId: string; confirmed: boolean; observation: string } }
    | { type: 'EVALUATE_SUPPLIER'; payload: { poId: string; rating: number; comment: string } }
    | { type: 'UPDATE_SETTINGS', payload: Settings };