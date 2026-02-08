import { Pedido } from './pedido.models';

export enum TipoCanal {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH_NOTIFICATION',
    WHATSAPP = 'WHATSAPP'
}

export enum StatusEnvio {
    ENVIADO = 'ENVIADO',
    FALHA = 'FALHA',
    PENDENTE = 'PENDENTE'
}

export interface Notificacao {
    id: string;
    clienteId?: string;
    destinatario: string;
    titulo: string;
    mensagem: string;
    canal: TipoCanal;
    status: StatusEnvio;
    dataEnvio: string;
}

export interface StatCard {
    title: string;
    value: string;
    change: string;
    positive: boolean;
    period: string;
    icon: string;
    colorClass: string;
}

export interface ChartData {
    label: string;
    height: string;
}

export interface Dashboard {
    stats: StatCard[];
    chartData: ChartData[];
    recentOrders: Pedido[];
}