import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemStatusService } from '../../../services/systemStatus.service';
import { ToastService } from '../../../services/toast.service';
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';

@Component({
    selector: 'app-recover-password-page',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './recover-password-page.component.html',
    styleUrl: './recover-password-page.component.css'
})

export class RecoverPasswordPageComponent implements OnInit {
    public config = BRAND_CONFIG;
    public systemStatus = inject(SystemStatusService);
    
    private fb = inject(FormBuilder);
    private toastService = inject(ToastService);
    
    isLoading = signal(false);
    isSuccess = signal(false);
    
    recoveryForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    ngOnInit() {
        this.systemStatus.checkHealth();
    }

    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.recoveryForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    onSubmit() {
        if (this.recoveryForm.valid) {
            if (this.systemStatus.isSystemOffline()) {
                this.toastService.error('Erro', 'Sistema indisponível no momento.');
                return;
            }

            this.isLoading.set(true);
            
            setTimeout(() => {
                this.isLoading.set(false);
                this.isSuccess.set(true);
                this.toastService.success('Instruções Enviadas', 'Verifique o seu e-mail para continuar.');
            }, 1500);
        } else {
            this.recoveryForm.markAllAsTouched();
        }
    }
    
    resetForm() {
        this.isSuccess.set(false);
        this.recoveryForm.reset();
    }

    retryConnection() {
        this.systemStatus.checkHealth();
    }
}