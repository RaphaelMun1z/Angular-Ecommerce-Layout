import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Categoria,
    Produto,
    ProdutoFiltro,
} from '../../models/catalogo.models';
import { CatalogoService } from '../../services/catalogo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product/product-card/product-card.component';

export interface FiltroBusca extends ProdutoFiltro {
    marcas?: string[];
    avaliacao?: number;
}

@Component({
    selector: 'app-search-page',
    imports: [CommonModule, FormsModule, ProductCardComponent],
    templateUrl: './search-page.component.html',
    styleUrl: './search-page.component.css',
})
export class SearchPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private catalogoService = inject(CatalogoService);

    produtos: Produto[] = [];
    loading: boolean = false;
    totalElements: number = 0;
    maxPrecoLimite: number = 5000;

    filtros: FiltroBusca = {
        termo: '',
        categoriaId: '',
        precoMin: 0,
        precoMax: 99990,
        marcas: [],
        avaliacao: undefined,
    };

    categoriasDisponiveis: Categoria[] = [];
    marcasDisponiveis = ['Apple', 'Samsung', 'LG', 'Logitech', 'Sony', 'Acer'];
    viewMode: 'grid' | 'list' = 'grid';

    ordenacaoAtual: string = '';
    opcoesOrdenacao = [
        { label: 'Relevância', value: '' },
        { label: 'Menor Preço', value: 'preco,asc' },
        { label: 'Maior Preço', value: 'preco,desc' },
        { label: 'Nome (A-Z)', value: 'titulo,asc' },
        { label: 'Nome (Z-A)', value: 'titulo,desc' },
    ];

    // =================== PAGINAÇÃO ===================
    paginaAtual: number = 0; // página atual (0-based)
    tamanhoPagina: number = 12; // produtos por página
    totalPaginas: number = 0; // total de páginas

    ngOnInit(): void {
        this.carregarCategorias();

        this.route.queryParams.subscribe((params) => {
            this.filtros.termo = params['termo'] || '';
            this.filtros.categoriaId = params['categoria'] || '';
            this.filtros.marcas = params['marcas']
                ? params['marcas'].split(',')
                : [];
            this.filtros.avaliacao = params['avaliacao']
                ? Number(params['avaliacao'])
                : undefined;

            const pMin = params['min'] ? Number(params['min']) : 0;
            const pMax = params['max'] ? Number(params['max']) : null;
            this.filtros.precoMin = pMin;
            this.filtros.precoMax = pMax !== null ? pMax : 99990;

            this.ordenacaoAtual = params['sort'] || '';

            this.buscarProdutos();
        });
    }

    carregarCategorias(): void {
        this.catalogoService.listarCategoriasAtivas({ size: 50 }).subscribe({
            next: (response: any) => {
                this.categoriasDisponiveis = response.content || [];
            },
            error: (err) => console.error(err),
        });
    }

    get percentMin(): number {
        if (this.maxPrecoLimite === 0) return 0;
        return Math.min(
            (this.filtros.precoMin / this.maxPrecoLimite) * 100,
            100,
        );
    }

    get percentMax(): number {
        if (this.maxPrecoLimite === 0) return 100;
        return Math.min(
            (this.filtros.precoMax / this.maxPrecoLimite) * 100,
            100,
        );
    }

    get filtrosAtivosList() {
        const list = [];
        if (this.filtros.termo) {
            list.push({ key: 'termo', label: `Busca: ${this.filtros.termo}` });
        }
        if (this.filtros.categoriaId) {
            const cat = this.categoriasDisponiveis.find(
                (c) => c.id === this.filtros.categoriaId,
            );
            if (cat) list.push({ key: 'categoria', label: cat.nome });
        }
        if (this.filtros.precoMin > 0 || this.filtros.precoMax < 99990) {
            list.push({
                key: 'preco',
                label: `R$ ${this.filtros.precoMin || 0} - ${this.filtros.precoMax || 'Máx'}`,
            });
        }
        if (this.filtros.marcas && this.filtros.marcas.length > 0) {
            this.filtros.marcas.forEach((marca) => {
                list.push({ key: `marca-${marca}`, label: marca });
            });
        }
        if (this.filtros.avaliacao) {
            list.push({
                key: 'avaliacao',
                label: `${this.filtros.avaliacao} Estrelas ou mais`,
            });
        }
        return list;
    }

    aplicarFiltros(): void {
        if (this.filtros.precoMin > this.filtros.precoMax) {
            const temp = this.filtros.precoMin;
            this.filtros.precoMin = this.filtros.precoMax;
            this.filtros.precoMax = temp;
        }

        // Reset da página para 0 ao aplicar filtros
        this.paginaAtual = 0;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                termo: this.filtros.termo || null,
                categoria: this.filtros.categoriaId || null,
                min: this.filtros.precoMin > 0 ? this.filtros.precoMin : null,
                max:
                    this.filtros.precoMax < this.maxPrecoLimite
                        ? this.filtros.precoMax
                        : null,
                marcas: this.filtros.marcas?.length
                    ? this.filtros.marcas.join(',')
                    : null,
                avaliacao: this.filtros.avaliacao || null,
                sort: this.ordenacaoAtual || null,
            },
            queryParamsHandling: 'merge',
        });

        this.buscarProdutos();
    }

    mudarOrdenacao(): void {
        this.aplicarFiltros();
    }

    limparPreco(): void {
        this.filtros.precoMin = 0;
        this.filtros.precoMax =
            this.maxPrecoLimite > 0 ? this.maxPrecoLimite : 99990;
        this.aplicarFiltros();
    }

    selecionarCategoria(id: string): void {
        this.filtros.categoriaId = id;
        this.aplicarFiltros();
    }

    toggleMarca(marca: string): void {
        if (!this.filtros.marcas) this.filtros.marcas = [];
        const index = this.filtros.marcas.indexOf(marca);
        if (index > -1) {
            this.filtros.marcas.splice(index, 1);
        } else {
            this.filtros.marcas.push(marca);
        }
        this.aplicarFiltros();
    }

    removerFiltro(key: string): void {
        if (key === 'termo') this.filtros.termo = '';
        if (key === 'categoria') this.filtros.categoriaId = '';
        if (key === 'preco') {
            this.filtros.precoMin = 0;
            this.filtros.precoMax = 99990;
        }
        if (key === 'avaliacao') this.filtros.avaliacao = undefined;
        if (key.startsWith('marca-') && this.filtros.marcas) {
            const marcaParaRemover = key.replace('marca-', '');
            this.filtros.marcas = this.filtros.marcas.filter(
                (m) => m !== marcaParaRemover,
            );
        }
        this.aplicarFiltros();
    }

    limparFiltros(): void {
        this.filtros = {
            termo: '',
            categoriaId: '',
            precoMin: 0,
            precoMax: 99990,
            marcas: [],
            avaliacao: undefined,
        };
        this.aplicarFiltros();
    }

    buscarProdutos(): void {
        this.loading = true;

        const pageable: any = {
            page: this.paginaAtual,
            size: this.tamanhoPagina,
        };
        if (this.ordenacaoAtual) {
            pageable.sort = [this.ordenacaoAtual];
        }

        this.catalogoService
            .buscarProdutosComFiltro(this.filtros, pageable)
            .subscribe({
                next: (response: any) => {
                    const pageInfo = response.page || response;
                    this.produtos = response.content || [];
                    this.totalElements =
                        pageInfo.totalElements || this.produtos.length;
                    this.totalPaginas = Math.ceil(
                        this.totalElements / this.tamanhoPagina,
                    );

                    if (this.produtos.length > 0) {
                        const maxPrecoNaLista = Math.max(
                            ...this.produtos.map((p) => p.preco),
                        );
                        if (
                            maxPrecoNaLista > this.maxPrecoLimite ||
                            this.maxPrecoLimite === 5000
                        ) {
                            this.maxPrecoLimite = Math.ceil(maxPrecoNaLista);
                        }
                        if (this.filtros.precoMax === 99990) {
                            this.filtros.precoMax = this.maxPrecoLimite;
                        }
                    }
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                },
            });
    }

    // =================== FUNÇÃO PAGINAÇÃO ===================
    irParaPagina(pagina: number) {
        if (pagina < 0 || pagina >= this.totalPaginas) return;
        this.paginaAtual = pagina;
        this.buscarProdutos();

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
}
