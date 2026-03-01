import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { AuthService } from '../../../core/auth/auth.service';
import {
    EntregaRequest,
    MetodoPagamento,
    PagamentoRequest,
	Pedido,
} from '../../../models/pedido.models';
import { CarrinhoService } from '../../../services/carrinho.service';
import { PedidoService } from '../../../services/pedido.service';
import { UsuarioService } from '../../../services/usuario.service';
import { IdentificationSectionComponent } from './components/identification-section/identification-section.component';
import { DeliveryAddressSectionComponent } from './components/delivery-address-section/delivery-address-section.component';
import { DeliveryOptionsSectionComponent } from './components/delivery-options-section/delivery-options-section.component';
import { PaymentSectionComponent } from './components/payment-section/payment-section.component';
import { OrderSummarySectionComponent } from './components/order-summary-section/order-summary-section.component';
import { TitleSectionComponent } from './components/title-section/title-section.component';
import { CheckoutService } from '../../../services/checkout.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-finalize-purchase-page',
    imports: [
        CommonModule,
        FormsModule,
        PaymentSectionComponent,
        OrderSummarySectionComponent,
        ReactiveFormsModule,
        IdentificationSectionComponent,
        DeliveryAddressSectionComponent,
        DeliveryOptionsSectionComponent,
        TitleSectionComponent,
    ],
    providers: [provideNgxMask()],
    templateUrl: './finalize-purchase-page.component.html',
    styleUrl: './finalize-purchase-page.component.css',
})
export class FinalizePurchasePageComponent {
    private authService = inject(AuthService);
    private carrinhoService = inject(CarrinhoService);
    private usuarioService = inject(UsuarioService);
    private checkoutService = inject(CheckoutService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    paymentMethod = signal<'credit' | 'pix' | 'boleto'>('pix');
    
    isLoading = signal(false);
    selectedAddressId = signal<string | null>(null);
    selectedShippingMethod = signal<'economic' | 'fast' | null>(null);

    showAddressForm = signal(false);
    editingAddress = signal<any>(null);

    userEmail = computed(() => this.authService.currentUser()?.email || '');
    cartItems = computed(() => this.carrinhoService.carrinho()?.itens || []);
    subtotal = computed(() => this.carrinhoService.valorTotal());
    addresses = this.usuarioService.enderecos;

    shippingCost = computed(() => {
        const method = this.selectedShippingMethod();
        if (method === 'fast') return 15.9;
        return 0.0;
    });

    total = computed(() => this.subtotal() + this.shippingCost());

    constructor() {
        effect(() => {
            const userId = this.authService.currentUser()?.id;
            if (userId) {
                this.carrinhoService.carregarCarrinho(userId);
                this.usuarioService.carregarEnderecos(userId);
            }
        });

        effect(() => {
            const addrs = this.addresses();
            if (addrs.length > 0 && !this.selectedAddressId()) {
                const principal = addrs.find((a) => a.principal);
                this.selectedAddressId.set(
                    principal ? principal.id : addrs[0].id,
                );
            }
        });
    }

    toggleAddressForm() {
        this.showAddressForm.update((v) => !v);
        if (!this.showAddressForm()) this.editingAddress.set(null);
    }

    editAddress(address: any) {
        this.editingAddress.set(address);
        this.showAddressForm.set(true);
    }

    deleteAddress(addressId: string) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;

        if (confirm('Tem certeza que deseja excluir este endereço?')) {
            this.usuarioService.removerEndereco(addressId, userId).subscribe({
                next: () => {
                    this.toastService.info('Endereço', 'Endereço removido.');
                    if (this.selectedAddressId() === addressId) {
                        this.selectedAddressId.set(null);
                        this.selectedShippingMethod.set(null);
                    }
                },
                error: () => this.toastService.error('Erro', 'Erro ao remover endereço.'),
            });
        }
    }

    setAsPrimary(addressId: string, event: Event) {
        event.stopPropagation();
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;

        this.isLoading.set(true);
        this.usuarioService.definirComoPrincipal(addressId, userId).subscribe({
            next: () => {
                this.toastService.success('Sucesso', 'Endereço definido como principal.');
                this.selectedAddressId.set(addressId);
            },
            error: () => this.toastService.error('Erro', 'Erro ao atualizar.'),
            complete: () => this.isLoading.set(false),
        });
    }

    handleAddressSave(addressData: any) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;

        this.isLoading.set(true);
        const action$ = this.editingAddress()
            ? this.usuarioService.atualizarEndereco(
                  this.editingAddress().id,
                  addressData,
                  userId,
              )
            : this.usuarioService.adicionarEndereco(userId, {
                  ...addressData,
                  principal: true,
              });

        action$.subscribe({
            next: () => {
                this.toastService.success(
                    'Sucesso',
                    this.editingAddress()
                        ? 'Endereço atualizado!'
                        : 'Endereço adicionado!',
                );
                this.toggleAddressForm();
            },
            error: () => this.toastService.error('Erro', 'Erro ao salvar endereço.'),
            complete: () => this.isLoading.set(false),
        });
    }

    setPayment(method: 'credit' | 'pix' | 'boleto') {
        this.paymentMethod.set(method);
    }

    confirmarPedido() {
        const userId = this.authService.currentUser()?.id;

        if (!userId) {
            this.toastService.error('Erro', 'Erro de autenticação.');
            return;
        }
        if (this.cartItems().length === 0) {
            this.toastService.warning('Atenção', 'Carrinho vazio.');
            return;
        }
        if (!this.selectedAddressId()) {
            this.toastService.warning('Atenção', 'Selecione um endereço.');
            return;
        }
        if (!this.selectedShippingMethod()) {
            this.toastService.warning('Atenção', 'Selecione o frete.');
            return;
        }

        const enderecoSelecionado = this.addresses().find(
            (a) => a.id === this.selectedAddressId(),
        );
        if (!enderecoSelecionado) return;

        this.isLoading.set(true);

        let metodoPagamentoEnum: MetodoPagamento;

        switch (this.paymentMethod()) {
            case 'credit':
                metodoPagamentoEnum = MetodoPagamento.CARTAO_CREDITO;
                break;
            case 'boleto':
                metodoPagamentoEnum = MetodoPagamento.BOLETO;
                break;
            case 'pix':
            default:
                metodoPagamentoEnum = MetodoPagamento.PIX;
                break;
        }

        this.checkoutService
            .processarCompraCompleta({
                userId: userId,
                endereco: enderecoSelecionado,
                metodoFrete: this.selectedShippingMethod()!,
                valorFrete: this.shippingCost(),
                metodoPagamento: metodoPagamentoEnum,
                total: this.total(),
            })
            .subscribe({
                next: (pedidoCriado: Pedido) => { 
                    this.toastService.success(
                        'Sucesso',
                        'Pedido criado! Redirecionando para pagamento...',
                    );
                    
                    this.carrinhoService.limparEstadoLocal();

                    const urlPagamento = pedidoCriado.pagamento?.urlPagamento;

                    if (urlPagamento) {
                        window.location.href = urlPagamento;
                    } else {
                        this.router.navigate(['/pedido-confirmado', pedidoCriado.id]);
                        this.isLoading.set(false);
                    }
                },
                error: (err) => {
                    console.error('Erro no checkout:', err);
                    const msg =
                        err.error && Array.isArray(err.error)
                            ? err.error[0]
                            : err.error?.message || 'Erro ao processar pedido.';
                    
                    this.toastService.error('Erro', msg);
                    this.isLoading.set(false);
                },
            });
    }
}
