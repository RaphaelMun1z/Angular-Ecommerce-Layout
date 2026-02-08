export interface Order {
    id: string;
    date: string;
    status: 'Entregue' | 'Em Trânsito' | 'Cancelado';
    statusColor: string;  
    statusBg: string; 
    statusText: string;
    total: number;
    itemsCount: number;
    images: string[];
    actionLabel: string;
}

export interface Address {
    id: number;
    label: string;
    street: string;
    city: string;
    zip: string;
    isMain: boolean;
}

export interface AdminOrder {
    id: string;
    customer: {
        name: string;
        email: string;
        avatar: string;
    };
    date: string;
    total: number;
    paymentStatus: 'Pago' | 'Pendente' | 'Falha' | 'Reembolsado';
    fulfillmentStatus: 'Não Enviado' | 'Enviado' | 'Entregue' | 'Devolvido';
    itemsCount: number;
}