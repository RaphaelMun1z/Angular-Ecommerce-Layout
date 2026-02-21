import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterRequest } from '../../../models/auth.models';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
    selector: 'app-register-customer-page',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register-customer-page.component.html',
    styleUrl: './register-customer-page.component.css'
})

export class RegisterCustomerPageComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private usuarioService = inject(UsuarioService);
    private http = inject(HttpClient);
    private toastr = inject(ToastrService);
    private router = inject(Router);
    
    isLoading = signal(false);
    isLoadingCep = signal(false);
    
    customerForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['123456', [Validators.required, Validators.minLength(6)]],
        document: ['', [Validators.required]], 
        phone: [''],
        
        zipCode: ['', [Validators.required]],
        street: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: [''],
        neighborhood: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        
        status: ['active'],
        group: ['retail'],
        newsletter: [true],
        notes: ['']
    });
    
    buscarCep() {
        const cep = this.customerForm.get('zipCode')?.value?.replace(/\D/g, '');
        if (!cep || cep.length !== 8) return;
        
        this.isLoadingCep.set(true);
        this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
            next: (dados) => {
                if (dados.erro) {
                    this.toastr.warning('CEP não encontrado.');
                } else {
                    this.customerForm.patchValue({
                        street: dados.logradouro,
                        neighborhood: dados.bairro,
                        city: dados.localidade,
                        state: dados.uf
                    });
                }
            },
            error: () => this.toastr.error('Erro ao buscar CEP.'),
            complete: () => this.isLoadingCep.set(false)
        });
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.customerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    onSubmit() {
        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            this.toastr.warning('Preencha os campos obrigatórios.');
            return;
        }
        
        this.isLoading.set(true);
        const val = this.customerForm.value;
        
        const registerReq: RegisterRequest = {
            nome: val.name,
            email: val.email,
            senha: val.password,
            cpf: val.document.replace(/\D/g, ''),
            telefone: val.phone
        };
        
        this.authService.register(registerReq).subscribe({
            next: (success) => {
                if (success) {
                    this.toastr.success('Cliente cadastrado com sucesso!');
                    this.router.navigate(['/dashboard-admin']);
                }
            },
            error: (err) => {
                this.toastr.error(err.error?.message || 'Erro ao cadastrar cliente.');
                this.isLoading.set(false);
            }
        });
    }
}
