import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Carrinho } from '../models/carrinho.models';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CarrinhoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/carrinho`;
    
    private _carrinho = signal<Carrinho | null>(null);
    public carrinho = this._carrinho.asReadonly();
    
    public quantidadeItens = computed(() => {
        const c = this._carrinho();
        return c ? c.itens.reduce((acc, item) => acc + item.quantidade, 0) : 0;
    });
    
    public valorTotal = computed(() => this._carrinho()?.total ?? 0);
    
    carregarCarrinho(clienteId: string) {
        this.http.get<Carrinho>(`${this.apiUrl}/${clienteId}`)
        .subscribe({
            next: (dados) => this._carrinho.set(dados),
            error: () => this._carrinho.set(null)
        });
    }
    
    adicionarItem(clienteId: string, produtoId: string, quantidade: number = 1) {
        return this.http.post<Carrinho>(
            `${this.apiUrl}/${clienteId}/adicionar`,
            {}, 
            { params: { produtoId, quantidade } }
        ).pipe(tap(c => this._carrinho.set(c)));
    }
    
    atualizarQuantidade(clienteId: string, produtoId: string, quantidade: number) {
        return this.http.patch<Carrinho>(
            `${this.apiUrl}/${clienteId}/atualizar/${produtoId}`,
            {},
            { params: { quantidade } }
        ).pipe(tap(c => this._carrinho.set(c)));
    }
    
    removerItem(clienteId: string, produtoId: string) {
        return this.http.delete<Carrinho>(`${this.apiUrl}/${clienteId}/remover/${produtoId}`)
        .pipe(tap(c => this._carrinho.set(c)));
    }
    
    limparCarrinho(clienteId: string) {
        return this.http.delete(`${this.apiUrl}/${clienteId}/limpar`)
        .pipe(tap(() => this._carrinho.set(null)));
    }
    
    limparEstadoLocal() {
        this._carrinho.set(null);
    }
}