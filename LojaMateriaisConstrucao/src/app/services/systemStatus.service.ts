import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class SystemStatusService {
    private http = inject(HttpClient);
    private toastService = inject(ToastService);
    private apiUrl = `${environment.apiUrl}/status/ping`;
    
    // Estado Global de Conectividade
    private _isSystemOffline = signal(false);
    public isSystemOffline = this._isSystemOffline.asReadonly();
    
    /**
    * Realiza a checagem de saúde da API.
    * Pode ser chamado em qualquer lugar ou via interceptor.
    */
    checkHealth() {
        this.http.get(this.apiUrl, { observe: 'response' }).subscribe({
            next: () => {
                this._isSystemOffline.set(false);
            },
            error: (err) => {
                // Status 0: Erro de rede/CORS (Servidor desligado)
                // Status >= 500: Erro interno catastrófico
                if (err.status === 0 || err.status >= 500) {
                    if (!this._isSystemOffline()) {
                        this.toastService.error('Erro de Conexão', 'O servidor parece estar fora do ar.');
                    }
                    this._isSystemOffline.set(true);
                } else {
                    // Outros erros (4xx) significam que o servidor respondeu, logo está online
                    this._isSystemOffline.set(false);
                }
            }
        });
    }
    
    setOffline(status: boolean) {
        this._isSystemOffline.set(status);
    }
}