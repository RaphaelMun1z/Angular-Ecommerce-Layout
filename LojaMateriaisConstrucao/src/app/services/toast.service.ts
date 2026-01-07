import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
    title: string;
    message: string;
    type: ToastType;
}

@Injectable({
    providedIn: 'root' // Garante que o serviço seja uma instância única em toda a app
})
export class ToastService {
    // Estado reativo do Toast
    private _visible = signal(false);
    public visible = this._visible.asReadonly();
    
    private _data = signal<ToastData>({ title: '', message: '', type: 'success' });
    public data = this._data.asReadonly();
    
    /**
    * Exibe o toast global
    * @param title Título do alerta
    * @param message Mensagem detalhada
    * @param type Tipo visual (success, error, etc)
    * @param duration Tempo em ms (padrão 4s)
    */
    show(title: string, message: string, type: ToastType = 'success', duration: number = 4000) {
        this._data.set({ title, message, type });
        this._visible.set(true);
        
        // Auto-ocultar após o tempo definido
        setTimeout(() => {
            this.hide();
        }, duration);
    }
    
    hide() {
        this._visible.set(false);
    }
    
    // Atalhos úteis
    success(title: string, message: string) { this.show(title, message, 'success'); }
    error(title: string, message: string) { this.show(title, message, 'error'); }
    warning(title: string, message: string) { this.show(title, message, 'warning'); }
}