import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '../../models/auth.models'; 
import { tap, map, catchError, of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/auth`;
    private clienteUrl = `${environment.apiUrl}/clientes`;
        
    private _accessToken = signal<string | null>(localStorage.getItem('access_token'));
    public accessToken = this._accessToken.asReadonly();
    
    private _currentUser = signal<User | null>(null);
    public currentUser = this._currentUser.asReadonly();
    
    public isAuthenticated = computed(() => !!this._accessToken());
    
    public isAdmin = computed(() => this.hasRole('ROLE_ADMIN'));
    
    constructor() {
        const token = this._accessToken();
        if (token) {
            this.decodeAndSetUser(token);
            this.refreshUserData();
        }
    }
    
    refreshUserData() {
        this.http.get<any>(`${this.clienteUrl}/me`).subscribe({
            next: (dadosBanco) => {
                const rawAvatar = dadosBanco.avatar || dadosBanco.fotoUrl;
                
                const avatarUrl = rawAvatar && !rawAvatar.startsWith('http') 
                ? `${environment.apiUrl}/arquivos/download/${rawAvatar}` 
                : rawAvatar;
                
                this._currentUser.set({
                    id: dadosBanco.id,
                    email: dadosBanco.email,
                    name: dadosBanco.nome,     
                    cpf: dadosBanco.cpf,       
                    phone: dadosBanco.telefone,
                    avatar: avatarUrl,    
                    roles: dadosBanco.roles || this._currentUser()?.roles || []
                });
            },
            error: (err) => {
                console.warn('Falha na sincronização de perfil em background.', err.status);
                if (err.status === 401 || err.status === 403) this.cleanSession();
            }
        });
    }
    
    updateUser(updates: Partial<User>) {
        this._currentUser.update(current => {
            if (!current) return null;
            return { ...current, ...updates };
        });
    }
        
    login(credentials: LoginRequest): Observable<boolean> {
        return this.http.post<TokenResponse>(`${this.apiUrl}/signin`, credentials).pipe(
            tap(response => this.handleAuthSuccess(response)),
            map(() => true),
            catchError(() => of(false))
        );
    }
    
    register(data: RegisterRequest): Observable<boolean> {
        return this.http.post(`${this.apiUrl}/signup`, data).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }
    
    logout() {
        this._accessToken.set(null);
        this._currentUser.set(null);
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        
        this.router.navigate(['/login']);
    }
    
    cleanSession() {
        this.logout();
    }
        
    private handleAuthSuccess(response: TokenResponse) {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('username', response.username);
        
        this._accessToken.set(response.accessToken);
        this.decodeAndSetUser(response.accessToken);
        this.refreshUserData();
    }
    
    private decodeAndSetUser(token: string) {
        try {
            const payload = this.parseJwt(token);
            this._currentUser.set({
                id: payload.id,
                email: payload.sub,
                roles: payload.roles || [],
                name: payload.name || payload.sub.split('@')[0],
                avatar: undefined
            });
        } catch (e) {
            this.logout();
        }
    }
    
    private parseJwt(token: string) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    }
    
    hasRole(role: string): boolean {
        return this.currentUser()?.roles?.includes(role) ?? false;
    }
    
    hasAnyRole(requiredRoles: string[]): boolean {
        const userRoles = this.currentUser()?.roles || [];
        return requiredRoles.some(role => userRoles.includes(role));
    }
}