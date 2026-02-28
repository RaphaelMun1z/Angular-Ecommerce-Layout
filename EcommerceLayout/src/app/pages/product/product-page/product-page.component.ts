import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { provideNgxMask } from 'ngx-mask';
import { AuthService } from '../../../core/auth/auth.service';
import { Produto } from '../../../models/catalogo.models';
import { CarrinhoService } from '../../../services/carrinho.service';
import { CatalogoService } from '../../../services/catalogo.service';
import { FileUploadService } from '../../../services/fileUpload.service';
import { FavoritoService } from '../../../services/favorito.service';
import { ShippingCalculatorComponent } from "../../../shared/components/forms/shipping-calculator/shipping-calculator.component";
import { SystemStatusService } from '../../../services/systemStatus.service';

@Component({
    selector: 'app-product-page',
    imports: [CommonModule, FormsModule, RouterLink, ShippingCalculatorComponent],
    providers: [provideNgxMask()],
    templateUrl: './product-page.component.html',
    styleUrl: './product-page.component.css'
})

export class ProductPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private toastr = inject(ToastrService);
    private catalogoService = inject(CatalogoService);
    private carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);
    
    public favoritoService = inject(FavoritoService); 
    public systemStatus = inject(SystemStatusService);
    
    product = signal<Produto | null>(null);
    loading = signal(true);
    
    get p() { return this.product(); }
    
    productImages = signal<string[]>([]); 
    currentImage = signal<string>('');    
    quantity = signal(1);
     
    zoomTransform = signal('scale(1)');
    zoomOrigin = signal('center center');
    
    zipCode = signal('');
    shippingResult = signal<null | { type: string, days: number, price: number }[]>(null);

    // --- CONTROLES DE INTERFACE ---
    tastes = ['Milk Chocolate', 'Dark Chocolate', 'Fruity Nuts', 'Chocoberries'];
    selectedTaste = signal('Milk Chocolate');
    
    sizes = ['100 g', '200 g', '500 g'];
    selectedSize = signal('200 g');

    showAllSpecs = signal(false); // Controle da expansão das características

    // Controle de Paginação de Reviews
    currentReviewPage = signal(0);
    reviewsPerPage = signal(3);
    
    // Dados estruturados
    productExtras = {
        rating: 4.8, 
        reviewsCount: 587, 
        brand: 'TREATO',
        mainSpecs: [
            { label: "Marca", value: "Electrolux" },
            { label: "Linha", value: "Rita Lobo" },
            { label: "Modelo", value: "EAF90" },
            { label: "Modelo alfanumérico", value: "5211AABR408" },
            { label: "Cor", value: "Grafite" }
        ],
        dimensionSpecs: [
            { label: "Altura", value: "40,9 cm" },
            { label: "Largura", value: "32,2 cm" },
            { label: "Comprimento", value: "37,6 cm" },
            { label: "Peso", value: "6,8 kg" }
        ],
        otherSpecs: [
            { label: "Funções", value: "Fritar, Assar" },
            { label: "Tipos de controle", value: "Digital" },
            { label: "Voltagem", value: "110V/220V" },
            { label: "Potência", value: "1400W" }
        ],
        ratingDistribution: [
            { stars: 5, count: 374 },
            { stars: 4, count: 183 },
            { stars: 3, count: 25 },
            { stars: 2, count: 4 },
            { stars: 1, count: 1 }
        ],
        reviews: [
            { user: "Emily R.", date: "Hoje", rating: 5, text: "I've tried a few sleep aids before, but this sleeping tape from Blume is a game-changer. It's comfortable and stays in place all night. I wake up feeling rested and my breathing feels natural. Highly recommend!" },
            { user: "Laura G.", date: "Ontem", rating: 4, text: "While the tape works as advertised, I have sensitive skin, and I found it a bit irritating after a few nights. If you don't have sensitive skin, it's a good product, but it didn't work perfectly for me." },
            { user: "Carlos M.", date: "15/10/2023", rating: 5, text: "Produto excelente, atendeu todas as expectativas. Chegou antes do prazo e muito bem embalado." },
            { user: "Fernanda T.", date: "02/09/2023", rating: 5, text: "A qualidade do material é incrível. Já recomendei para todos os meus amigos." },
            { user: "Roberto A.", date: "28/08/2023", rating: 3, text: "É bom, mas achei que seria um pouco maior. De qualquer forma, cumpre o que promete." },
            { user: "Juliana P.", date: "10/08/2023", rating: 4, text: "Gostei bastante, a única ressalva é a embalagem que veio um pouco amassada." }
        ]
    };
    
    // --- COMPUTEDS E PAGINAÇÃO ---

    finalPrice = computed(() => {
        const p = this.product();
        if (!p) return 0;
        return p.precoPromocional || p.preco;
    });
    
    discountPercentage = computed(() => {
        const p = this.product();
        if (!p || !p.precoPromocional) return 0;
        return Math.round(((p.preco - p.precoPromocional) / p.preco) * 100);
    });

    totalReviewPages = computed(() => {
        return Math.ceil(this.productExtras.reviews.length / this.reviewsPerPage());
    });

    visibleReviewPages = computed(() => {
        return Array.from({ length: this.totalReviewPages() }, (_, i) => i);
    });

    paginatedReviews = computed(() => {
        const start = this.currentReviewPage() * this.reviewsPerPage();
        return this.productExtras.reviews.slice(start, start + this.reviewsPerPage());
    });
    
    // --- MÉTODOS DO CICLO DE VIDA E AÇÕES ---

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadProduct(id);
            } else {
                this.toastr.error('ID do produto inválido');
                this.router.navigate(['/']);
            }
        });
    }
    
    loadProduct(id: string) {
        if (this.systemStatus.isSystemOffline()) {
            this.loading.set(false);
            return;
        }
        
        this.loading.set(true);
        this.catalogoService.obterProduto(id).subscribe({
            next: (data) => {
                this.product.set(data);
                
                if (data.imagens && data.imagens.length > 0) {
                    const resolvedImages = data.imagens.map((img: any) => img.url || img);
                    this.productImages.set(resolvedImages);
                    this.currentImage.set(resolvedImages[0]);
                } else {
                    const placeholder = 'https://placehold.co/600x600/f3f4f6/a1a1aa?text=Sem+Imagem';
                    this.productImages.set([placeholder, placeholder, placeholder, placeholder]); 
                    this.currentImage.set(placeholder);
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
        if (id) {
            this.systemStatus.checkHealth();
            this.loadProduct(id);
        }
    }
    
    toggleFavorite() {
        const p = this.product();
        if (p) this.favoritoService.toggle(p.id);
    }
    
    changeImage(img: string) {
        this.currentImage.set(img);
    }
    
    updateQty(delta: number) {
        const newVal = this.quantity() + delta;
        if (newVal >= 1) this.quantity.set(newVal);
    }

    // Navegação de Reviews
    changeReviewPage(delta: number) {
        const next = this.currentReviewPage() + delta;
        if (next >= 0 && next < this.totalReviewPages()) {
            this.currentReviewPage.set(next);
        }
    }

    goToReviewPage(page: number) {
        if (page >= 0 && page < this.totalReviewPages()) {
            this.currentReviewPage.set(page);
        }
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
    
    addToCart() {
        const p = this.product();
        if (!p) return;
        
        if (p.estoque <= 0) {
            this.toastr.warning('Produto fora de estoque.');
            return;
        }
        
        if (!this.authService.isAuthenticated()) {
            this.toastr.info('Faça login para comprar.');
            this.router.navigate(['/login']);
            return;
        }
        
        const userId = this.authService.currentUser()?.id;
        if (userId) {
            this.carrinhoService.adicionarItem(userId, p.id, this.quantity()).subscribe({
                next: () => this.toastr.success(`Your order is placed! Thank you.`), 
                error: () => this.toastr.error('Erro ao adicionar.')
            });
        }
    }
    
    calculateShipping() {
        this.toastr.info('Calculando opções de entrega...');
    }
}