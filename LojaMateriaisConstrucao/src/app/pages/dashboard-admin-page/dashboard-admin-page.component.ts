import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardOrder, DashboardStatCard } from '../../shared/interfaces/Dashboard';

@Component({
    selector: 'app-dashboard-admin-page',
    imports: [CommonModule],
    templateUrl: './dashboard-admin-page.component.html',
    styleUrl: './dashboard-admin-page.component.css'
})

export class DashboardAdminPageComponent {
    // Estado UI
    isSidebarOpen = signal(false);
    selectedPeriod = signal('Este Mês');
    
    // Dados Mockados - Stats
    stats = signal<DashboardStatCard[]>([
        { 
            title: 'Vendas Totais', 
            value: 'R$ 128.450', 
            change: '12%', 
            isPositive: true, 
            comparisonText: 'vs. R$ 114.680 mês anterior',
            icon: 'ph-currency-dollar', 
            colorClass: 'bg-green-50 text-green-600' 
        },
        { 
            title: 'Novos Pedidos', 
            value: '1,245', 
            change: '5.4%', 
            isPositive: true, 
            comparisonText: 'vs. 1,180 mês anterior',
            icon: 'ph-shopping-cart', 
            colorClass: 'bg-brand-50 text-brand-600' 
        },
        { 
            title: 'Ticket Médio', 
            value: 'R$ 342,00', 
            change: '2%', 
            isPositive: false, 
            comparisonText: 'vs. R$ 349,00 mês anterior',
            icon: 'ph-chart-line-down', 
            colorClass: 'bg-blue-50 text-blue-600' 
        },
        { 
            title: 'Devoluções', 
            value: '12', 
            change: '0.5%', 
            isPositive: true, // Verde pois caiu (o que é bom para devoluções) mas a lógica visual pode variar
            comparisonText: 'vs. 15 mês anterior',
            icon: 'ph-arrow-u-up-left', 
            colorClass: 'bg-purple-50 text-purple-600' 
        }
    ]);
    
    // Dados Mockados - Gráfico
    chartData = signal([
        { label: 'Seg', height: '40%' },
        { label: 'Ter', height: '65%' },
        { label: 'Qua', height: '45%' },
        { label: 'Qui', height: '80%' },
        { label: 'Sex', height: '55%' },
        { label: 'Sáb', height: '90%' },
        { label: 'Dom', height: '30%' },
    ]);
    
    // Dados Mockados - Pedidos Recentes
    recentOrders = signal<DashboardOrder[]>([
        {
            id: '#12345',
            customer: 'Roberto Silva',
            email: 'roberto@email.com',
            date: 'Hoje, 10:30',
            amount: 450.00,
            status: 'Concluído',
            avatar: 'https://ui-avatars.com/api/?name=Roberto+S&background=f3f4f6&color=4b5563'
        },
        {
            id: '#12346',
            customer: 'Ana Clara',
            email: 'ana.c@email.com',
            date: 'Ontem, 16:45',
            amount: 1250.90,
            status: 'Processando',
            avatar: 'https://ui-avatars.com/api/?name=Ana+C&background=e0e7ff&color=4338ca'
        },
        {
            id: '#12347',
            customer: 'Construtora Forte',
            email: 'compras@forte.com',
            date: '28 Dez, 09:15',
            amount: 5400.00,
            status: 'Pendente',
            avatar: 'https://ui-avatars.com/api/?name=Forte&background=fef3c7&color=d97706'
        },
        {
            id: '#12348',
            customer: 'Marcos Paulo',
            email: 'mp@email.com',
            date: '27 Dez, 14:20',
            amount: 120.50,
            status: 'Cancelado',
            avatar: 'https://ui-avatars.com/api/?name=Marcos+P&background=fee2e2&color=dc2626'
        }
    ]);
    
    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }
    
    setPeriod(period: string) {
        this.selectedPeriod.set(period);
        // Aqui você adicionaria lógica para filtrar os dados baseado no período
    }
    
    getPeriodClass(period: string): string {
        const base = "px-3 py-1.5 text-xs font-medium rounded-md transition-all ";
        if (this.selectedPeriod() === period) {
            return base + "bg-white text-gray-900 shadow-sm border border-gray-100";
        }
        return base + "text-gray-500 hover:text-gray-900 hover:bg-gray-50";
    }
    
    getStatusClass(status: string): string {
        switch (status) {
            case 'Concluído': return 'bg-green-50 text-green-700 border-green-100';
            case 'Processando': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Pendente': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'Cancelado': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    }
}
