import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCard } from '../../../models/analitico.models';
import { Pedido } from '../../../models/pedido.models';
import { AnaliticoService } from '../../../services/analitico.service';

@Component({
    selector: 'app-main-page',
    imports: [CommonModule, RouterLink],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.css'
})

export class MainPageComponent implements OnInit {
    private analiticoService = inject(AnaliticoService);

    periods = ['Hoje', '7 Dias', 'Este Mês'];
    activePeriod = signal('Este Mês');
    
    stats = signal<StatCard[]>([]);
    recentOrders = signal<Pedido[]>([]);
    isLoading = signal(true);

    ngOnInit() {
        this.loadDashboardData();
    }

    setPeriod(period: string) {
        this.activePeriod.set(period);
        this.loadDashboardData();
    }
    
    loadDashboardData() {
        this.isLoading.set(true);
        this.analiticoService.obterVisaoGeral().subscribe({
            next: (data) => {
                this.stats.set(data.stats);
                this.recentOrders.set(data.recentOrders);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar dados do dashboard', err);
                this.isLoading.set(false);
            }
        });
    }
    
    getStatusClass(status: string) {
        const base = 'px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold border ';
        
        const styles: Record<string, string> = {
            'PAGO': 'bg-green-50 text-green-700 border-green-200',
            'PENDENTE': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'AGUARDANDO_PAGAMENTO': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'CANCELADO': 'bg-red-50 text-red-700 border-red-200',
            'PROCESSANDO': 'bg-blue-50 text-blue-700 border-blue-200',
            'EM_PREPARACAO': 'bg-blue-50 text-blue-700 border-blue-200',
            'ENVIADO': 'bg-purple-50 text-purple-700 border-purple-200',
            'ENTREGUE': 'bg-green-50 text-green-700 border-green-200'
        };
        
        return base + (styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-100');
    }
}