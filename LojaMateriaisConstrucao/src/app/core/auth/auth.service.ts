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
    
    // --- ESTADO (Signals) ---
    
    private _accessToken = signal<string | null>(localStorage.getItem('access_token'));
    public accessToken = this._accessToken.asReadonly();
    
    private _currentUser = signal<User | null>(null);
    public currentUser = this._currentUser.asReadonly();
    
    public isAuthenticated = computed(() => !!this._accessToken());
    
    // Verifica se é Admin de forma reativa
    public isAdmin = computed(() => this.hasRole('ROLE_ADMIN'));
    
    constructor() {
        const token = this._accessToken();
        if (token) {
            // 1. Restaura estado básico pelo Token (Id, Email, Roles)
            this.decodeAndSetUser(token);
            // 2. Sincroniza dados detalhados (Nome, CPF, Telefone, Foto)
            this.refreshUserData();
        }
    }
    
    /**
    * Sincroniza os dados do banco (Java) com o estado global (TS).
    * Resolve o problema de propriedades 'undefined' e reconstrói a URL da imagem.
    */
    refreshUserData() {
        this.http.get<any>(`${this.clienteUrl}/me`).subscribe({
            next: (dadosBanco) => {
                // Identifica o campo de imagem (pode vir como 'avatar' ou 'fotoUrl' dependendo do DTO)
                const rawAvatar = dadosBanco.avatar || dadosBanco.fotoUrl;
                
                // Constrói a URL completa se o banco retornar apenas o nome do ficheiro
                const avatarUrl = rawAvatar && !rawAvatar.startsWith('http') 
                ? `${environment.apiUrl}/arquivos/download/${rawAvatar}` 
                : rawAvatar;
                
                // Mapeia as propriedades do Java para o modelo User do TypeScript
                // Isso remove o 'undefined' do console log e popula o objeto corretamente
                this._currentUser.set({
                    id: dadosBanco.id,
                    email: dadosBanco.email,
                    name: dadosBanco.nome,      // Java 'nome' -> TS 'name'
                    cpf: dadosBanco.cpf,        // Java 'cpf' -> TS 'cpf'
                    phone: dadosBanco.telefone, // Java 'telefone' -> TS 'phone'
                    avatar: avatarUrl,          // URL formatada pronta para o <img>
                    roles: dadosBanco.roles || this._currentUser()?.roles || []
                });
            },
            error: (err) => {
                console.warn('Falha na sincronização de perfil em background.', err.status);
                // Se o erro for de autenticação (Token inválido no servidor), limpa a sessão
                if (err.status === 401 || err.status === 403) this.cleanSession();
            }
        });
    }
    
    /**
    * Atualiza partes do usuário em memória (ex: após upload de foto)
    */
    updateUser(updates: Partial<User>) {
        this._currentUser.update(current => {
            if (!current) return null;
            return { ...current, ...updates };
        });
    }
    
    // --- AÇÕES ---
    
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
        // Limpa estado reativo
        this._accessToken.set(null);
        this._currentUser.set(null);
        
        // Limpa storage físico
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        
        this.router.navigate(['/login']);
    }
    
    cleanSession() {
        this.logout();
    }
    
    // --- MÉTODOS PRIVADOS ---
    
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
                avatar: undefined // Começa indefinido até o refreshUserData injetar a URL
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
    
    /**
    * Verifica se o usuário tem uma role específica (atalho para isAdmin)
    */
    hasRole(role: string): boolean {
        return this.currentUser()?.roles?.includes(role) ?? false;
    }
    
    /**
    * Método utilitário para verificar permissões
    */
    hasAnyRole(requiredRoles: string[]): boolean {
        const userRoles = this.currentUser()?.roles || [];
        return requiredRoles.some(role => userRoles.includes(role));
    }
}