export interface DashboardStatCard {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    comparisonText: string;
    icon: string;
    colorClass: string;
}

export interface DashboardOrder {
    id: string;
    customer: string;
    email: string;
    date: string;
    amount: number;
    status: 'Concluído' | 'Processando' | 'Cancelado' | 'Pendente';
    avatar: string;
}