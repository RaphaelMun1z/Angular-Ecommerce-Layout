import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/auth.service';
import { CarrinhoService } from '../../../../services/carrinho.service';
import { Favorito } from '../../../../models/preferencias.models';
import { FavoritoService } from '../../../../services/favorito.service';
import { Categoria, Produto } from '../../../../models/catalogo.models';
import { ProductCardComponent } from "../../product/product-card/product-card.component";

@Component({
    selector: 'app-my-favorite-products',
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './my-favorite-products.component.html',
    styleUrl: './my-favorite-products.component.css'
})
export class MyFavoriteProductsComponent {
    private toastr = inject(ToastrService);
    private carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);
    private favoritoService = inject(FavoritoService);
    
    favorites = signal<Favorito[]>([]);
    isLoading = signal(true);
    
    constructor() {
        effect(() => {
            const userId = this.authService.currentUser()?.id;
            if (userId) {
                this.carregarFavoritos(userId);
            } else {
                this.favorites.set([]);
                this.isLoading.set(false);
            }
        });
    }
    
    carregarFavoritos(userId: string) {
        this.isLoading.set(true);
        this.favoritoService.listar(userId, { page: 0, size: 50 }).subscribe({
            next: (page) => {
                this.favorites.set(page.content);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Erro ao carregar favoritos.');
                this.isLoading.set(false);
            }
        });
    }
    
    removeFavorite(item: Favorito) {
        this.favorites.update(list => list.filter(fav => fav.id !== item.id));
        this.favoritoService.remover(item.produtoId);
    }
    
    addToCart(product: Produto) {
        const userId = this.authService.currentUser()?.id;
        
        if (!userId) {
            this.toastr.warning('Faça login para adicionar ao carrinho.');
            return;
        }
        
        this.carrinhoService.adicionarItem(userId, product.id).subscribe({
            next: () => this.toastr.success(`${product.titulo} adicionado ao carrinho!`),
            error: () => this.toastr.error('Erro ao adicionar produto.')
        });
    }
    
    clearAll() {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        if (confirm('Deseja limpar toda a sua lista de favoritos?')) {
            this.favoritoService.limparTudo(userId).subscribe({
                next: () => {
                    this.favorites.set([]);
                    this.toastr.info('Lista de favoritos limpa.');
                },
                error: () => this.toastr.error('Erro ao limpar lista.')
            });
        }
    }
    
    mapToProduto(fav: Favorito): Produto {
        const hasPromo = !!fav.precoOriginal;
        
        return {
            id: fav.produtoId,
            titulo: fav.titulo,
            codigoControle: fav.codigoControle,
            descricao: fav.descricao,
            
            preco: hasPromo ? fav.precoOriginal! : fav.preco,
            precoPromocional: hasPromo ? fav.preco : undefined,
            
            estoque: fav.emEstoque ? 100 : 0, 
            ativo: true,
            
            categoria: { 
                id: '', 
                nome: fav.categoria, 
                slug: '', 
                ativa: true, 
                subcategorias: [] 
            },
            
            imagens: fav.imagens ? fav.imagens.map((url, index) => ({
                id: `img-${index}`,
                url: url,
                ordem: index,
                principal: index === 0
            })) : []
        };
    }
}
