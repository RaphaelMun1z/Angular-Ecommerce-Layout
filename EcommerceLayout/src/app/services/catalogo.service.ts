import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Page, PageableParams } from '../models/shared.models';
import { Produto, ProdutoFiltro, Categoria, ProdutoRequest, CategoriaRequest } from '../models/catalogo.models';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CatalogoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;
    private categoriasUrl = `${this.apiUrl}/categorias`;
    private produtosUrl = `${this.apiUrl}/produtos`;

    // --- MÉTODOS DE PRODUTOS ---

    listarProdutosVitrine(pageable?: PageableParams): Observable<Page<Produto>> {
        let params = this.buildPageParams(pageable);
        return this.http.get<Page<Produto>>(`${this.produtosUrl}/vitrine`, { params });
    }
    
    listarTodosProdutosAdmin(pageable?: PageableParams): Observable<Page<Produto>> {
        let params = this.buildPageParams(pageable);
        return this.http.get<Page<Produto>>(`${this.produtosUrl}`, { params });
    }
    
    buscarProdutosComFiltro(filtro: ProdutoFiltro, pageable?: PageableParams): Observable<Page<Produto>> {
        let params = this.buildPageParams(pageable);
        if (filtro.termo) params = params.set('termo', filtro.termo);
        if (filtro.categoriaId) params = params.set('categoriaId', filtro.categoriaId);
        if (filtro.precoMin !== undefined) params = params.set('precoMin', filtro.precoMin.toString());
        if (filtro.precoMax !== undefined) params = params.set('precoMax', filtro.precoMax.toString());
        if (filtro.apenasAtivos !== undefined) params = params.set('apenasAtivos', filtro.apenasAtivos);
        
        return this.http.get<Page<Produto>>(`${this.produtosUrl}/buscar`, { params });
    }
    
    obterProduto(id: string): Observable<Produto> {
        return this.http.get<Produto>(`${this.produtosUrl}/${id}`);
    }
    
    salvarProduto(produto: ProdutoRequest): Observable<Produto> {
        return this.http.post<Produto>(`${this.produtosUrl}`, produto);
    }
    
    atualizarProduto(id: string, produto: ProdutoRequest): Observable<Produto> {
        return this.http.put<Produto>(`${this.produtosUrl}/${id}`, produto);
    }
    
    excluirProduto(id: string): Observable<void> {
        return this.http.delete<void>(`${this.produtosUrl}/${id}`);
    }
    
    ativarProduto(id: string): Observable<void> {
        return this.http.patch<void>(`${this.produtosUrl}/${id}/ativar`, {});
    }
    
    desativarProduto(id: string): Observable<void> {
        return this.http.patch<void>(`${this.produtosUrl}/${id}/desativar`, {});
    }

    // --- MÉTODOS DE CATEGORIAS (ALINHADOS COM O CONTROLLER) ---

    listarTodasCategorias(pageable?: PageableParams): Observable<Page<Categoria>> {
        const params = this.buildPageParams(pageable);
        return this.http.get<Page<Categoria>>(`${this.categoriasUrl}`, { params });
    }

    listarCategoriasAtivas(pageable?: PageableParams): Observable<Page<Categoria>> {
        const params = this.buildPageParams(pageable);
        return this.http.get<Page<Categoria>>(`${this.categoriasUrl}/ativas`, { params });
    }

    obterCategoria(id: string): Observable<Categoria> {
        return this.http.get<Categoria>(`${this.categoriasUrl}/${id}`);
    }

    salvarCategoria(categoria: CategoriaRequest): Observable<Categoria> {
        return this.http.post<Categoria>(`${this.categoriasUrl}`, categoria);
    }

    atualizarCategoria(id: string, categoria: CategoriaRequest): Observable<Categoria> {
        return this.http.put<Categoria>(`${this.categoriasUrl}/${id}`, categoria);
    }

    excluirCategoria(id: string): Observable<void> {
        return this.http.delete<void>(`${this.categoriasUrl}/${id}`);
    }

    ativarCategoria(id: string): Observable<void> {
        return this.http.patch<void>(`${this.categoriasUrl}/${id}/ativar`, {});
    }

    desativarCategoria(id: string): Observable<void> {
        return this.http.patch<void>(`${this.categoriasUrl}/${id}/desativar`, {});
    }

    // --- UTILITÁRIOS ---
    
    private buildPageParams(pageable?: PageableParams): HttpParams {
        let params = new HttpParams();
        if (pageable) {
            if (pageable.page !== undefined) params = params.set('page', pageable.page);
            if (pageable.size !== undefined) params = params.set('size', pageable.size);
            if (pageable.sort) params = params.set('sort', pageable.sort);
        }
        return params;
    }
}