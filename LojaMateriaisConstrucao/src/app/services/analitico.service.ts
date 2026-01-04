import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Dashboard, Notificacao } from '../models/analitico.models';
import { Page, PageableParams } from '../models/shared.models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnaliticoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;
    
    // Dashboard
    obterVisaoGeral(): Observable<Dashboard> {
        return this.http.get<Dashboard>(`${this.apiUrl}/dashboard/visao-geral`);
    }
    
    // Notificações
    listarNotificacoes(clienteId: string, pageable?: PageableParams): Observable<Page<Notificacao>> {
        let params = new HttpParams();
        if (pageable?.page) params = params.set('page', pageable.page);
        if (pageable?.size) params = params.set('size', pageable.size);
        
        return this.http.get<Page<Notificacao>>(`${this.apiUrl}/notificacoes/cliente/${clienteId}`, { params });
    }
    
    // Relatórios (Download Blob)
    
    /**
    * Baixa o relatório de vendas em formato CSV para o período informado.
    */
    baixarRelatorioVendas(inicio?: string, fim?: string): Observable<Blob> {
        let params = new HttpParams();
        if (inicio) params = params.set('inicio', inicio);
        if (fim) params = params.set('fim', fim);
        
        return this.http.get(`${this.apiUrl}/relatorios/vendas`, { 
            params, 
            responseType: 'blob' 
        });
    }
    
    /**
    * Baixa o relatório de posição de estoque atual em formato CSV.
    */
    baixarRelatorioEstoque(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/relatorios/estoque`, { 
            responseType: 'blob' 
        });
    }
}