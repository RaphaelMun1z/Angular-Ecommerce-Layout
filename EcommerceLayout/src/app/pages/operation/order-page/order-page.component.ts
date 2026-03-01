import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    Pedido,
    StatusPedido,
    ItemPedido,
	StatusPagamento,
} from '../../../models/pedido.models';
import { PedidoService } from '../../../services/pedido.service';
import { TimelineStep } from '../../../shared/interfaces/Cart';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-order-page',
    imports: [CommonModule, RouterLink],
    providers: [DatePipe],
    templateUrl: './order-page.component.html',
    styleUrl: './order-page.component.css',
})
export class OrderPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private pedidoService = inject(PedidoService);
    private toastService = inject(ToastService);
    private datePipe = inject(DatePipe);

    pedido = signal<Pedido | null>(null);
    loading = signal(true);
    timelineSteps = signal<TimelineStep[]>([]);

    private statusOrder: Record<string, number> = {
        [StatusPedido.AGUARDANDO_PAGAMENTO]: 0,
        [StatusPedido.PAGO]: 1,
        [StatusPedido.EM_PREPARACAO]: 2,
        [StatusPedido.ENVIADO]: 3,
        [StatusPedido.ENTREGUE]: 4,
        [StatusPedido.CANCELADO]: -1,
    };

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) this.carregarPedido(id);
            else this.router.navigate(['/perfil']);
        });
    }

    carregarPedido(id: string) {
        this.loading.set(true);
        this.pedidoService.buscarPorId(id).subscribe({
            next: (data) => {
                this.pedido.set(data);
                this.construirTimeline(data);
                this.loading.set(false);
            },
            error: () => {
                this.toastService.error('Erro', 'Pedido não encontrado.');
                this.router.navigate(['/perfil']);
            },
        });
    }

    private construirTimeline(pedido: Pedido) {
        const fmtDate = (date?: string) =>
            date ? this.datePipe.transform(date, 'HH:mm') || '' : '';

        const currentVal = this.statusOrder[pedido.status] ?? 0;

        if (pedido.status === StatusPedido.CANCELADO) {
            this.timelineSteps.set([
                {
                    label: 'Pedido Cancelado',
                    icon: 'ph-x-circle',
                    status: 'completed',
                    dateOrInfo: fmtDate(new Date().toISOString())
                },
                {
                    label: 'Pedido Realizado',
                    icon: 'ph-receipt',
                    status: 'completed',
                    dateOrInfo: fmtDate(pedido.dataPedido)
                }
            ]);
            return;
        }

        const steps: TimelineStep[] = [
            {
                label: 'Pedido Entregue',
                icon: 'ph-house',
                status: currentVal === 4 ? 'completed' : 'pending',
                dateOrInfo: pedido.entrega?.dataEntregaReal ? fmtDate(pedido.entrega.dataEntregaReal) : ''
            },
            {
                label: 'Em Transporte',
                icon: 'ph-truck',
                status: currentVal >= 3 ? 'completed' : 'pending',
                dateOrInfo: pedido.entrega?.dataEnvio ? fmtDate(pedido.entrega.dataEnvio) : ''
            },
            {
                label: 'Em Preparação',
                icon: 'ph-package',
                status: currentVal >= 2 ? 'completed' : 'pending',
                dateOrInfo: ''
            },
            {
                label: 'Pagamento Confirmado',
                icon: 'ph-check-circle',
                status: currentVal >= 1 ? 'completed' : 'pending',
                dateOrInfo: pedido.pagamento?.dataPagamento ? fmtDate(pedido.pagamento.dataPagamento) : ''
            },
            {
                label: 'Pedido Realizado',
                icon: 'ph-receipt',
                status: 'completed',
                dateOrInfo: fmtDate(pedido.dataPedido)
            }
        ];

        this.timelineSteps.set(steps);
    }

    get items(): ItemPedido[] {
        return this.pedido()?.itens || [];
    }
}