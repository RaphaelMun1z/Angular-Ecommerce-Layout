import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { AuthService } from '../../../core/auth/auth.service';
import { Produto } from '../../../models/catalogo.models';
import { CarrinhoService } from '../../../services/carrinho.service';
import { CatalogoService } from '../../../services/catalogo.service';
import { FavoritoService } from '../../../services/favorito.service';
import { ShippingCalculatorComponent } from "../../../shared/components/forms/shipping-calculator/shipping-calculator.component";
import { SystemStatusService } from '../../../services/systemStatus.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-product-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ShippingCalculatorComponent],
    providers: [provideNgxMask()],
    templateUrl: './product-page.component.html',
    styleUrl: './product-page.component.css'
})
export class ProductPageComponent implements OnInit {

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private toastService = inject(ToastService);
    private catalogoService = inject(CatalogoService);
    private carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);

    public favoritoService = inject(FavoritoService);
    public systemStatus = inject(SystemStatusService);

    // ===============================
    // STATE
    // ===============================

    product = signal<Produto | null>(null);
    loading = signal(true);

    productImages = signal<string[]>([]);
    currentImage = signal<string>('');

    quantity = signal(1);

    zoomTransform = signal('scale(1)');
    zoomOrigin = signal('center center');

    zipCode = signal('');
    shippingResult = signal<any>(null);

    showAllSpecs = signal(false);

    // ===============================
    // COMPUTEDS
    // ===============================

    finalPrice = computed(() => {
        const p = this.product();
        if (!p) return 0;
        return p.precoPromocional ?? p.preco;
    });

    discountPercentage = computed(() => {
        const p = this.product();
        if (!p || !p.precoPromocional) return 0;
        return Math.round(((p.preco - p.precoPromocional) / p.preco) * 100);
    });

    // ===============================
    // LIFECYCLE
    // ===============================

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');

            if (!id) {
                this.toastService.error('Erro', 'ID do produto inválido');
                this.router.navigate(['/']);
                return;
            }

            this.loadProduct(id);
        });
    }

    // ===============================
    // DATA LOAD
    // ===============================

    loadProduct(id: string) {

        if (this.systemStatus.isSystemOffline()) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);

        this.catalogoService.obterProduto(id).subscribe({
            next: (data) => {

                this.product.set(data);

                // Apenas imagens reais do backend
                if (data.imagens && data.imagens.length > 0) {
                    const resolvedImages = data.imagens.map((img: any) => img.url ?? img);
                    this.productImages.set(resolvedImages);
                    this.currentImage.set(resolvedImages[0]);
                } else {
                    this.productImages.set([]);
                    this.currentImage.set('');
                }

                this.quantity.set(1);
                this.loading.set(false);
            },
            error: (err) => {

                console.error('Erro ao carregar produto:', err);

                this.loading.set(false);
                this.product.set(null);

                if (err.status === 0 || err.status >= 500) {
                    this.systemStatus.checkHealth();
                }
            }
        });
    }

    retry() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        this.systemStatus.checkHealth();
        this.loadProduct(id);
    }

    // ===============================
    // UI ACTIONS
    // ===============================

    toggleFavorite() {
        const p = this.product();
        if (!p) return;

        this.favoritoService.toggle(p.id);
    }

    changeImage(img: string) {
        this.currentImage.set(img);
    }

    updateQty(delta: number) {
        const newVal = this.quantity() + delta;
        if (newVal >= 1) this.quantity.set(newVal);
    }

    onMouseMove(e: MouseEvent) {
        const element = e.currentTarget as HTMLElement;
        const { left, top, width, height } = element.getBoundingClientRect();

        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        this.zoomOrigin.set(`${x}% ${y}%`);
        this.zoomTransform.set('scale(2)');
    }

    onMouseLeave() {
        this.zoomTransform.set('scale(1)');
        this.zoomOrigin.set('center center');
    }

    // ===============================
    // CART
    // ===============================

    addToCart() {
        const p = this.product();
        if (!p) return;

        if (p.estoque <= 0) {
            this.toastService.warning('Estoque', 'Produto fora de estoque.');
            return;
        }

        if (!this.authService.isAuthenticated()) {
            this.toastService.info('Login', 'Faça login para comprar.');
            this.router.navigate(['/login']);
            return;
        }

        const userId = this.authService.currentUser()?.id;
        if (!userId) return;

        this.carrinhoService.adicionarItem(userId, p.id, this.quantity()).subscribe({
            next: () =>
                this.toastService.success('Carrinho', 'Produto adicionado ao carrinho.'),
            error: () =>
                this.toastService.error('Erro', 'Erro ao adicionar ao carrinho.')
        });
    }

    // ===============================
    // SHIPPING
    // ===============================

    calculateShipping() {
        this.toastService.info('Frete', 'Calculando opções de entrega...');
    }
}