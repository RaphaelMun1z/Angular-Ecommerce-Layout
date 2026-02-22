import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Produto } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-mixed-section',
    imports: [CommonModule],
    templateUrl: './mixed-section.component.html',
    styleUrl: './mixed-section.component.css',
})
export class MixedSectionComponent implements OnInit {
    private catalogoService = inject(CatalogoService);
    private router = inject(Router);

    itensEmAlta: Produto[] = [];

    // Novos estados para controlo de UI
    loading: boolean = true;
    error: boolean = false;

    ngOnInit(): void {
        this.carregarItensEmAlta();
    }

    carregarItensEmAlta(): void {
        // Inicia o carregamento e repõe o erro
        this.loading = true;
        this.error = false;

        // Busca os produtos para a secção. O "size: 6" preenche perfeitamente a grelha xl:grid-cols-3
        this.catalogoService
            .listarProdutosVitrine({ page: 0, size: 6 })
            .subscribe({
                next: (response: any) => {
                    this.loading = false;
                    if (response) {
                        this.itensEmAlta = response.content || [];
                    }
                },
                error: (err) => {
                    // Trata o erro e para o carregamento
                    this.loading = false;
                    this.error = true;
                    console.error('Erro ao buscar itens em alta:', err);
                },
            });
    }

    // Helper para procurar a imagem principal do produto
    getMainImage(produto: Produto): string {
        if (!produto.imagens || produto.imagens.length === 0) {
            return 'assets/placeholder-image.png';
        }
        const principal = produto.imagens.find((img) => img.principal);
        if (principal) return principal.url;

        return [...produto.imagens].sort((a, b) => a.ordem - b.ordem)[0].url;
    }

    // Helper para calcular a percentagem de desconto, caso exista
    getDesconto(produto: Produto): number | null {
        if (
            produto.precoPromocional &&
            produto.precoPromocional < produto.preco
        ) {
            const diferenca = produto.preco - produto.precoPromocional;
            return Math.round((diferenca / produto.preco) * 100);
        }
        return null;
    }

    goToProduct(id: string): void {
        this.router.navigate(['/produto', id]);
    }
}