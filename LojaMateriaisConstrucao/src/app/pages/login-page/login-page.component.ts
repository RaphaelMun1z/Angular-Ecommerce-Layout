import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BRAND_CONFIG } from '../../shared/mocks/BRAND_CONFIG';

@Component({
    selector: 'app-login-page',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})

export class LoginPageComponent {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'light';
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }

    private fb = inject(FormBuilder);
    
    // Estado
    isLoading = signal(false);
    showToast = signal(false);
    showPassword = signal(false);
    
    // Formulário Login
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });
    
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
            
            // Simulação de API
            setTimeout(() => {
                this.isLoading.set(false);
                this.showToast.set(true);
                setTimeout(() => this.showToast.set(false), 3000);
                console.log('Login:', this.loginForm.value);
            }, 1500);
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
