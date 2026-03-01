import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SystemStatusService } from '../../../services/systemStatus.service';
import { ToastService } from '../../../services/toast.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { cpf } from 'cpf-cnpj-validator';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  providers: [provideNgxMask()],
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

  signupForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
          this.cpfValidator.bind(this)
        ]
      ],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    },
    { validators: this.passwordMatchValidator }
  );

  ngOnInit() {
    this.systemStatus.checkHealth();
  }

  get fullName(): string {
    return `${this.config.namePrefix}${this.config.nameSuffix}`;
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  cpfValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const cleaned = control.value.replace(/\D/g, '');
    return cpf.isValid(cleaned) ? null : { invalidCpf: true };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { mismatch: true }
      : null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.signupForm.get(fieldName);

    if (control?.hasError('required')) return 'Campo obrigatório';
    if (control?.hasError('email')) return 'E-mail inválido';
    if (control?.hasError('minlength'))
      return `Mínimo de ${control.errors?.['minlength'].requiredLength} caracteres`;
    if (control?.hasError('pattern')) {
      if (fieldName === 'cpf') return 'Formato: 000.000.000-00';
      if (fieldName === 'phone') return 'Formato: (00) 00000-0000';
      return 'Formato inválido';
    }
    if (control?.hasError('invalidCpf')) return 'CPF inválido';
    if (this.signupForm.hasError('mismatch') && fieldName === 'confirmPassword')
      return 'As senhas não coincidem';

    return '';
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
        telefone: val.phone.replace(/\D/g, '')
      };

      this.authService.register(requestData).subscribe({
        next: success => {
          this.isLoading.set(false);
          if (success) {
            this.toastService.success('Sucesso!', 'Conta criada. Faça login.');
            this.router.navigate(['/login']);
          }
        },
        error: err => {
          this.isLoading.set(false);
          const errorMsg = err.error?.message || 'Falha no registro.';
          this.toastService.error('Erro no Servidor', errorMsg);
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
      this.toastService.warning(
        'Formulário Inválido',
        'Por favor, corrija os campos destacados em vermelho.'
      );
    }
  }
}