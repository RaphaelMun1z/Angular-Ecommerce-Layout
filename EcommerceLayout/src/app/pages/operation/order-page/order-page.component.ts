import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
    Pedido,
    StatusPedido,
    ItemPedido,
	StatusPagamento,
} from '../../../models/pedido.models';
import { PedidoService } from '../../../services/pedido.service';
import { TimelineStep } from '../../../shared/interfaces/Cart';

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
    private toastr = inject(ToastrService);
    private datePipe = inject(DatePipe);

    pedido = signal<Pedido | null>(null);
    loading = signal(true);

    timelineSteps = signal<TimelineStep[]>([]);
    solidProgress = signal(0);
    skeletonProgress = signal(0);

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
                this.toastr.error('Pedido não encontrado.', 'Erro');
                this.router.navigate(['/perfil']);
            },
        });
    }

    irParaPagamento(url?: string) {
        if (url) {
            this.toastr.info('Redirecionando para o pagamento...');
            window.location.href = url;
        } else {
            this.toastr.warning(
                'Link de pagamento indisponível. Entre em contato com o suporte.',
            );
        }
    }

    private construirTimeline(pedido: Pedido) {
        const fmtDate = (date?: string) =>
            date
                ? this.datePipe.transform(date, 'dd/MM/yy HH:mm') || ''
                : undefined;

        if (pedido.status === StatusPedido.CANCELADO) {
            this.timelineSteps.set([
                {
                    label: 'Realizado',
                    dateOrInfo: fmtDate(pedido.dataPedido),
                    status: 'completed',
                    icon: 'ph-shopping-cart',
                },
                {
                    label: 'Cancelado',
                    dateOrInfo: 'Pedido cancelado',
                    status: 'completed',
                    icon: 'ph-x-circle',
                },
            ]);
            this.solidProgress.set(100);
            this.skeletonProgress.set(0);
            return;
        }

        const currentVal = this.statusOrder[pedido.status] ?? 0;

        const steps: TimelineStep[] = [
            {
                label: 'Realizado',
                icon: 'ph-shopping-cart',
                status: 'completed',
                dateOrInfo: fmtDate(pedido.dataPedido),
            },
            {
                label: 'Pagamento',
                icon: 'ph-currency-dollar',
                status: currentVal >= 1 ? 'completed' : 'pending',
                dateOrInfo: pedido.pagamento?.dataPagamento
                    ? fmtDate(pedido.pagamento.dataPagamento)
                    : undefined,
            },
            {
                label: 'Preparação',
                icon: 'ph-package',
                status: currentVal > 2 ? 'completed' : 'pending',
                dateOrInfo: undefined,
            },
            {
                label: 'Transporte',
                icon: 'ph-truck',
                status: currentVal > 3 ? 'completed' : 'pending',
                dateOrInfo: pedido.entrega?.dataEnvio
                    ? fmtDate(pedido.entrega.dataEnvio)
                    : undefined,
            },
            {
                label: 'Entregue',
                icon: 'ph-house',
                status: currentVal === 4 ? 'completed' : 'pending',
                dateOrInfo: pedido.entrega?.dataEntregaReal
                    ? fmtDate(pedido.entrega.dataEntregaReal)
                    : pedido.entrega?.dataEstimadaEntrega
                      ? `Prev: ${this.datePipe.transform(
                            pedido.entrega.dataEstimadaEntrega,
                            'dd/MM',
                        )}`
                      : undefined,
            },
        ];

        this.timelineSteps.set(steps);

        const totalSegments = steps.length - 1;

        const lastCompletedIndex =
            [...steps]
                .map((s, i) => (s.status === 'completed' ? i : -1))
                .filter((i) => i !== -1)
                .pop() ?? 0;

        const solid = (lastCompletedIndex / totalSegments) * 100;
        const skeleton =
            lastCompletedIndex < totalSegments ? (1 / totalSegments) * 100 : 0;

        this.solidProgress.set(solid);
        this.skeletonProgress.set(skeleton);
    }

    get items(): ItemPedido[] {
        return this.pedido()?.itens || [];
    }

	gerarNotaFiscal() {
        const pedido = this.pedido();
        if (!pedido) return;

		if (pedido.pagamento?.status !== StatusPagamento.APROVADO) {
            this.toastr.warning('A Nota Fiscal só está disponível após a confirmação do pagamento.');
            return;
        }

        this.toastr.info('Preparando Nota Fiscal Provisória...');

        setTimeout(() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                const dataFormatada = this.datePipe.transform(pedido.dataPedido, 'dd/MM/yyyy HH:mm');
                
                const htmlContent = `
                    <html>
                    <head>
                        <title>Nota Fiscal Provisória - Pedido #${pedido.id.substring(0, 8).toUpperCase()}</title>
                        <style>
                            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 20px; }
                            h1 { font-size: 24px; margin: 0 0 10px 0; }
                            h2 { font-size: 16px; font-weight: normal; margin: 0; color: #555; }
                            .info-group { margin-bottom: 20px; }
                            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                            .label { font-weight: bold; }
                            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            .items-table th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
                            .items-table td { padding: 8px 0; border-bottom: 1px dashed #ccc; }
                            .totals { margin-top: 30px; border-top: 2px solid #000; padding-top: 15px; }
                            .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 10px; }
                            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); pointer-events: none; z-index: -1; font-weight: bold; border: 5px solid rgba(0,0,0,0.05); padding: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="watermark">SEM VALOR FISCAL</div>
                        
                        <div class="header">
                            <h1>DOCUMENTO AUXILIAR DE VENDA</h1>
                            <h2>Recibo Provisório de Conferência</h2>
                        </div>

                        <div class="info-group">
                            <div class="info-row"><span class="label">NÚMERO DO PEDIDO:</span> <span>#${pedido.id.toUpperCase()}</span></div>
                            <div class="info-row"><span class="label">DATA DA EMISSÃO:</span> <span>${dataFormatada}</span></div>
                            <div class="info-row"><span class="label">STATUS ATUAL:</span> <span>${pedido.status.replace(/_/g, ' ')}</span></div>
                        </div>

                        <div class="info-group">
                            <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">DADOS DO CLIENTE</div>
                            <div class="info-row"><span class="label">ID Cliente:</span> <span>${pedido.clienteId}</span></div>
                            ${pedido.entrega ? `
                            <div style="margin-top: 10px;">
                                <strong>Endereço de Entrega:</strong><br/>
                                ${pedido.entrega.logradouro}, ${pedido.entrega.numero}<br/>
                                ${pedido.entrega.bairro} - ${pedido.entrega.cidade}/${pedido.entrega.uf}<br/>
                                CEP: ${pedido.entrega.cep}
                            </div>
                            ` : ''}
                        </div>

                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>QTD</th>
                                    <th>DESCRIÇÃO</th>
                                    <th style="text-align: right;">UNITÁRIO</th>
                                    <th style="text-align: right;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pedido.itens.map(item => `
                                <tr>
                                    <td>${item.quantidade}</td>
                                    <td>${item.nomeProduto}</td>
                                    <td style="text-align: right;">R$ ${item.precoUnitario.toFixed(2)}</td>
                                    <td style="text-align: right;">R$ ${item.subTotal.toFixed(2)}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="totals">
                            <div class="info-row"><span class="label">Subtotal:</span> <span>R$ ${(pedido.valorTotal - (pedido.entrega?.valorFrete || 0)).toFixed(2)}</span></div>
                            <div class="info-row"><span class="label">Frete:</span> <span>R$ ${(pedido.entrega?.valorFrete || 0).toFixed(2)}</span></div>
                            <div class="total-row">
                                <span>TOTAL A PAGAR</span>
                                <span>R$ ${pedido.valorTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="footer">
                            <p>Este documento é apenas para conferência e não substitui a Nota Fiscal Eletrônica (NF-e).</p>
                            <p>Gerado pelo sistema em ${new Date().toLocaleString()}</p>
                        </div>

                        <script>
                            window.onload = function() { window.print(); }
                        </script>
                    </body>
                    </html>
                `;
                
                printWindow.document.write(htmlContent);
                printWindow.document.close();
            }
        }, 800);
    }
}
