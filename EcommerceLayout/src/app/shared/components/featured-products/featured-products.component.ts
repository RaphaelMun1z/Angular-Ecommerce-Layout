import { Component, inject, OnInit } from '@angular/core';
import { ProductCardComponent } from '../product/product-card/product-card.component';
import { Produto } from '../../../models/catalogo.models';
import { CommonModule } from '@angular/common';
import { Page } from '../../../models/shared.models';
import { CatalogoService } from '../../../services/catalogo.service';

@Component({
    selector: 'app-featured-products',
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './featured-products.component.html',
    styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
    private catalogoService = inject(CatalogoService);

    produtosDestaque: Produto[] = [];

    // Novos estados para controle de UI
    loading: boolean = true;
    error: boolean = false;

    ngOnInit(): void {
        this.carregarProdutos();
    }

    carregarProdutos(): void {
        // Inicia o carregamento e reseta o erro
        this.loading = true;
        this.error = false;

        this.catalogoService.listarProdutosVitrine({ size: 5 }).subscribe({
            next: (response: Page<Produto>) => {
                this.loading = false;

                if (response && response.content) {
                    this.produtosDestaque = response.content;
                }
            },
            error: (err) => {
                // Trata o erro e para o carregamento
                this.loading = false;
                this.error = true;
                console.error('Erro ao buscar produtos em destaque:', err);
            },
        });
    }
}
