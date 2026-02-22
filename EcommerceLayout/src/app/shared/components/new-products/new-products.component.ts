import { Component, inject, OnInit } from '@angular/core';
import { Produto } from '../../../models/catalogo.models';
import { Page } from '../../../models/shared.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { ProductCardComponent } from '../product/product-card/product-card.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-new-products',
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './new-products.component.html',
    styleUrl: './new-products.component.css',
})
export class NewProductsComponent implements OnInit {
    private catalogoService = inject(CatalogoService);

    produtosLancamento: Produto[] = [];

    currentPage: number = 0;
    totalPages: number = 0;
    pageSize: number = 5;

    // Novos estados para controle de UI
    loading: boolean = true;
    error: boolean = false;

    ngOnInit(): void {
        this.carregarProdutos(this.currentPage);
    }

    carregarProdutos(page: number): void {
        // Inicia o carregamento e reseta o erro
        this.loading = true;
        this.error = false;

        this.catalogoService
            .listarProdutosVitrine({
                page: page,
                size: this.pageSize,
                sort: 'id,desc',
            })
            .subscribe({
                next: (response: any) => {
                    this.loading = false;

                    if (response) {
                        this.produtosLancamento = response.content || [];
                        const pageInfo = response.page || response;
                        this.currentPage = pageInfo.number || 0;
                        this.totalPages = pageInfo.totalPages || 0;
                    }
                },
                error: (err) => {
                    // Trata o erro e para o carregamento
                    this.loading = false;
                    this.error = true;
                    console.error('Erro ao buscar lançamentos:', err);
                },
            });
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
            this.carregarProdutos(page);
        }
    }

    getPagesArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i);
    }
}
