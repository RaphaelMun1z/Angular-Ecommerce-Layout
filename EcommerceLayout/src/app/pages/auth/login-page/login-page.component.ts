import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';
import { ToastService } from '../../../services/toast.service';
import { SystemStatusService } from '../../../services/systemStatus.service';

@Component({
    selector: 'app-login-page',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})

export class LoginPageComponent implements OnInit {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'light';
    
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);
    
    public systemStatus = inject(SystemStatusService);
    
    isLoading = signal(false);
    showPassword = signal(false);
    
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });
    
    ngOnInit() {
        this.authService.logout();
        this.systemStatus.checkHealth();
    }
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    togglePassword() {
        this.showPassword.update(v => !v);
    }
    
    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            
            const { email, password } = this.loginForm.value;
            const credentials = { email, senha: password };
            
            this.authService.login(credentials).subscribe({
                next: (success) => {
                    this.isLoading.set(false);
                    if (success) {
                        this.toastService.success('Bem-vindo!', 'Login realizado com sucesso.');
                        setTimeout(() => this.router.navigate(['/']), 1000); 
                    } else {
                        this.toastService.error('Erro de Acesso', 'E-mail ou senha inválidos.');
                    }
                },
                error: (err) => {
                    this.isLoading.set(false);
                    
                    if (err.status === 0) {
                        this.systemStatus.setOffline(true);
                    } else {
                        this.toastService.error('Erro', 'Falha na comunicação com o servidor.');
                    }
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
