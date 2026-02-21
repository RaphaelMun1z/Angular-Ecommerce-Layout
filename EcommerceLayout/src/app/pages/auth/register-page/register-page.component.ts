import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SystemStatusService } from '../../../services/systemStatus.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-register-page',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register-page.component.html',
    styleUrl: './register-page.component.css'
})

export class RegisterPageComponent implements OnInit {
    public config = BRAND_CONFIG;
    public systemStatus = inject(SystemStatusService);
    
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private router = inject(Router);
    
    @Input() color: 'dark' | 'light' = 'light';
    
    isLoading = signal(false);
    showPassword = signal(false);
    
    signupForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        cpf: ['', [Validators.required, Validators.minLength(11)]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
    
    ngOnInit() {
        this.systemStatus.checkHealth();
    }
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { mismatch: true };
        }
        return null;
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.signupForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    onSubmit() {
        if (this.signupForm.valid) {
            this.isLoading.set(true);
            
            const val = this.signupForm.value;
            
            const requestData = {
                nome: val.name,
                email: val.email,
                senha: val.password,
                cpf: val.cpf.replace(/\D/g, ''),
                telefone: val.phone
            };
            
            this.authService.register(requestData).subscribe({
                next: (success) => {
                    this.isLoading.set(false);
                    if (success) {
                        this.toastService.success('Sucesso!', 'Conta criada com sucesso. Faça login para continuar.');
                        this.router.navigate(['/login']);
                    } else {
                        this.toastService.error('Erro no Cadastro', 'Verifique os dados informados e tente novamente.');
                    }
                },
                error: (err) => {
                    this.isLoading.set(false);
                    if (err.status === 0) {
                        this.systemStatus.setOffline(true);
                    } else {
                        const errorMsg = err.error?.message || 'Falha ao processar o registo.';
                        this.toastService.error('Erro', errorMsg);
                    }
                }
            });
        } else {
            this.signupForm.markAllAsTouched();
            this.toastService.warning('Atenção', 'Preencha todos os campos obrigatórios corretamente.');
        }
    }
}