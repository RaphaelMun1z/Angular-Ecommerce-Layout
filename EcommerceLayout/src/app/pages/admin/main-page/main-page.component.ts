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
    styleUrl: './main-page.component.css',
})
export class MainPageComponent implements OnInit {
    private analiticoService = inject(AnaliticoService);

    // Variáveis de Estado (Signals)
    stats = signal<StatCard[]>([]);
    recentOrders = signal<Pedido[]>([]);
    isLoading = signal(true);

    // Inicia com os últimos 30 dias por padrão
    dataInicio = signal<string>(this.calcularDataOffet(-30));
    dataFim = signal<string>(this.calcularDataOffet(0));

    // Array mockado temporariamente enquanto não vem da API
    chartData = signal([
        { label: 'Jan', profit: 45, loss: 30 },
        { label: 'Fev', profit: 60, loss: 25 },
        { label: 'Abr', profit: 75, loss: 12 },
        { label: 'Mai', profit: 85, loss: 15 },
        { label: 'Jun', profit: 50, loss: 30 },
        { label: 'Jul', profit: 55, loss: 35 },
    ]);

    ngOnInit() {
        this.loadDashboardData();
    }

    // Handlers para o evento de change dos inputs de data do HTML
    onDataInicioChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dataInicio.set(input.value);
    }

    onDataFimChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dataFim.set(input.value);
    }

    // Ação ao clicar no botão "Aplicar"
    aplicarFiltro() {
        if (!this.dataInicio() || !this.dataFim()) {
            return;
        }

        // Verifica se data de início é maior que a data de fim
        if (new Date(this.dataInicio()) > new Date(this.dataFim())) {
            alert('A data de início não pode ser maior que a data de fim.');
            return;
        }

        this.loadDashboardData();
    }

    loadDashboardData() {
        this.isLoading.set(true);

        // Atualize seu AnaliticoService para receber esses dois parâmetros!
        this.analiticoService
            .obterVisaoGeral(this.dataInicio(), this.dataFim())
            .subscribe({
                next: (data) => {
                    this.stats.set(data.stats);
                    this.recentOrders.set(data.recentOrders);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Erro ao carregar dados do dashboard', err);
                    this.isLoading.set(false);
                },
            });
    }

    // Método Utilitário para formatar datas em `YYYY-MM-DD` com compensação de dias
    private calcularDataOffet(dias: number): string {
        const d = new Date();
        d.setDate(d.getDate() + dias);
        return d.toISOString().split('T')[0];
    }

    getStatusClass(status: string) {
        const base =
            'px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold border ';

        const styles: Record<string, string> = {
            PAGO: 'bg-green-50 text-green-700 border-green-200',
            PENDENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            AGUARDANDO_PAGAMENTO:
                'bg-yellow-50 text-yellow-700 border-yellow-200',
            CANCELADO: 'bg-red-50 text-red-700 border-red-200',
            PROCESSANDO: 'bg-blue-50 text-blue-700 border-blue-200',
            EM_PREPARACAO: 'bg-blue-50 text-blue-700 border-blue-200',
            ENVIADO: 'bg-purple-50 text-purple-700 border-purple-200',
            ENTREGUE: 'bg-green-50 text-green-700 border-green-200',
        };

        return (
            base +
            (styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-100')
        );
    }
}
