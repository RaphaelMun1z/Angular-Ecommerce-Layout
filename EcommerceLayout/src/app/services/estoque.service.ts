import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MovimentacaoEstoque, MovimentacaoEstoqueRequest } from '../models/estoque.models';
import { Page, PageableParams } from '../models/shared.models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EstoqueService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/estoque`;
    
    buscarHistorico(produtoId: string, pageable?: PageableParams): Observable<Page<MovimentacaoEstoque>> {
        let params = new HttpParams();
        if (pageable?.page) params = params.set('page', pageable.page);
        
        return this.http.get<Page<MovimentacaoEstoque>>(`${this.apiUrl}/historico/${produtoId}`, { params });
    }
    
    registrarMovimentacao(dto: MovimentacaoEstoqueRequest): Observable<MovimentacaoEstoque> {
        return this.http.post<MovimentacaoEstoque>(`${this.apiUrl}/movimentacao`, dto);
    }
}