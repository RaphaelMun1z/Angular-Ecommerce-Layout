import { Component, inject, OnInit, signal } from '@angular/core';
import { Produto, ProdutoFiltro } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { PageableParams } from '../../../models/shared.models';
import { ActivatedRoute } from '@angular/router';
import { HeroSectionComponent } from "../hero-section/hero-section.component";
import { BrandsStripComponent } from "../brands-strip/brands-strip.component";
import { PromoBannersGridComponent } from "../promo-banners-grid/promo-banners-grid.component";
import { FeaturedProductsComponent } from "../featured-products/featured-products.component";
import { NewProductsComponent } from "../new-products/new-products.component";
import { MixedSectionComponent } from "../mixed-section/mixed-section.component";
import { HorizontalPromoBannerComponent } from "../horizontal-promo-banner/horizontal-promo-banner.component";
import { FAQSectionComponent } from "../faqsection/faqsection.component";
import { TechTalkComponent } from "../tech-talk/tech-talk.component";
import { NewsletterComponent } from "../newsletter/newsletter.component";

@Component({
    selector: 'app-main-layout',
    imports: [HeroSectionComponent, BrandsStripComponent, PromoBannersGridComponent, FeaturedProductsComponent, NewProductsComponent, MixedSectionComponent, HorizontalPromoBannerComponent, FAQSectionComponent, TechTalkComponent, NewsletterComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'
})

export class MainLayoutComponent implements OnInit {
    private catalogoService = inject(CatalogoService);
    private route = inject(ActivatedRoute);
    
    produtos = signal<Produto[]>([]);
    loading = signal(true);
    hasError = signal(false);
    
    totalItems = signal(0);
    totalPages = signal(0);
    currentPage = signal(0); 
    pageSize = signal(12); 
    
    isMobileFilterOpen = signal(false);
    viewMode = signal<'grid' | 'list'>('grid');
    currentSort = signal(''); 
    currentFilter = signal<ProdutoFiltro | null>(null);
    
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const termo = params['termo'];
            if (termo) {
                this.currentFilter.set({
                    ...(this.currentFilter() || { precoMin: 0, precoMax: 10000, apenasAtivos: true }),
                    termo: termo
                });
            }
            this.carregarDados();
        });
    }
    
    carregarDados() {
        this.loading.set(true);
        this.hasError.set(false);
        
        const pageParams: PageableParams = { 
            page: this.currentPage(), 
            size: this.pageSize(), 
            sort: this.currentSort() 
        };
        
        const requisicao$ = this.currentFilter() 
        ? this.catalogoService.buscarProdutosComFiltro(this.currentFilter()!, pageParams)
        : this.catalogoService.listarProdutosVitrine(pageParams);
        
        requisicao$.subscribe({
            next: (response: any) => {
                this.produtos.set(response.content);
                
                if (response.page) {
                    this.totalItems.set(response.page.totalElements);
                    this.totalPages.set(response.page.totalPages);
                    this.currentPage.set(response.page.number); 
                }
                
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar produtos', err);
                this.produtos.set([]);
                this.hasError.set(true);
                this.loading.set(false);
            }
        });
    }
    
    onPageChange(page: number) {
        this.currentPage.set(page);
        this.carregarDados();
    }
    
    aplicarFiltros(filtro: ProdutoFiltro) {
        this.currentFilter.set(filtro);
        this.currentPage.set(0);
        this.carregarDados();
    }
    
    aplicarOrdenacao(sort: string) {
        this.currentSort.set(sort);
        this.currentPage.set(0);
        this.carregarDados();
    }
    
    alterarVisualizacao(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }
}