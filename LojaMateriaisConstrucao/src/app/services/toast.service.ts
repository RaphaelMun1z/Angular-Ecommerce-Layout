import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
    title: string;
    message: string;
    type: ToastType;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private _visible = signal(false);
    public visible = this._visible.asReadonly();
    
    private _data = signal<ToastData>({ title: '', message: '', type: 'success' });
    public data = this._data.asReadonly();
    
    show(title: string, message: string, type: ToastType = 'success', duration: number = 4000) {
        this._data.set({ title, message, type });
        this._visible.set(true);
        
        setTimeout(() => {
            this.hide();
        }, duration);
    }
    
    hide() {
        this._visible.set(false);
    }
    
    success(title: string, message: string) { this.show(title, message, 'success'); }
    error(title: string, message: string) { this.show(title, message, 'error'); }
    warning(title: string, message: string) { this.show(title, message, 'warning'); }
}