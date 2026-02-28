import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    Component,
    computed,
    inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterRequest } from '../../../models/auth.models';
import { UsuarioService } from '../../../services/usuario.service';
import { Observable, Subject, debounceTime, takeUntil } from 'rxjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
    selector: 'app-register-customer-page',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgxMaskDirective,
    ],
    providers: [provideNgxMask()],
    templateUrl: './register-customer-page.component.html',
    styleUrl: './register-customer-page.component.css',
})
export class RegisterCustomerPageComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private usuarioService = inject(UsuarioService);
    private http = inject(HttpClient);
    private toastr = inject(ToastrService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private destroy$ = new Subject<void>();

    private readonly DRAFT_KEY = 'admin_customer_draft_real';

    isLoading = signal(false);
    isLoadingCep = signal(false);
    isEditing = signal(false);
    customerId = signal<string | null>(null);
    currentStep = signal(1);

    steps = [
        {
            id: 1,
            title: 'Dados Pessoais',
            desc: 'Identificação básica para validação.',
            icon: 'ph-identification-card',
        },
        {
            id: 2,
            title: 'Contato e Acesso',
            desc: 'Informações de login e segurança.',
            icon: 'ph-envelope-simple',
        },
        {
            id: 3,
            title: 'Endereço Atual',
            desc: 'Local principal para faturamento e entrega.',
            icon: 'ph-map-pin',
        },
        {
            id: 4,
            title: 'Revisão e Perfil',
            desc: 'Acessos e notas do sistema.',
            icon: 'ph-list-checks',
        },
    ];

    currentStepData = computed(
        () =>
            this.steps.find((s) => s.id === this.currentStep()) ||
            this.steps[0],
    );

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
        notes: [''],
    });

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const id = params['id'];
            if (id) {
                this.customerId.set(id);
                this.isEditing.set(true);

                this.customerForm.get('password')?.clearValidators();
                this.customerForm.get('password')?.updateValueAndValidity();

                this.carregarDadosCliente(id);
            } else {
                this.loadDraft();
            }
        });

        this.customerForm.valueChanges
            .pipe(debounceTime(500), takeUntil(this.destroy$))
            .subscribe((val) => {
                if (!this.isEditing()) {
                    localStorage.setItem(this.DRAFT_KEY, JSON.stringify(val));
                }
            });
    }

    private loadDraft() {
        const draft = localStorage.getItem(this.DRAFT_KEY);
        if (draft) {
            try {
                const parsedDraft = JSON.parse(draft);
                this.customerForm.patchValue(parsedDraft, { emitEvent: false });
            } catch (e) {
                console.error('Erro ao ler rascunho do localStorage', e);
            }
        }
    }

    carregarDadosCliente(id: string) {
        this.isLoading.set(true);
        this.usuarioService.obterCliente(id).subscribe({
            next: (cliente: any) => {
                this.customerForm.patchValue({
                    name: cliente.nome,
                    email: cliente.email,
                    document: cliente.cpf,
                    phone: cliente.telefone,
                    zipCode: cliente.endereco?.cep || '',
                    street: cliente.endereco?.logradouro || '',
                    number: cliente.endereco?.numero || '',
                    complement: cliente.endereco?.complemento || '',
                    neighborhood: cliente.endereco?.bairro || '',
                    city: cliente.endereco?.cidade || '',
                    state: cliente.endereco?.uf || '',
                    group: cliente.grupo || 'retail',
                    newsletter: cliente.newsletter || false,
                    notes: cliente.notas || '',
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Erro ao carregar dados do cliente.');
                this.router.navigate(['/dashboard-admin/clientes']);
            },
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    nextStep() {
        if (this.isCurrentStepValid()) {
            this.currentStep.set(this.currentStep() + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.toastr.warning(
                'Preencha os campos obrigatórios corretamente para avançar.',
                'Atenção',
            );
            this.markStepAsTouched();
        }
    }

    prevStep() {
        if (this.currentStep() > 1) {
            this.currentStep.set(this.currentStep() - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    isCurrentStepValid(): boolean {
        const fieldsByStep: Record<number, string[]> = {
            1: ['name', 'document'],
            2: this.isEditing() ? ['email'] : ['email', 'password'],
            3: ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state'],
            4: [],
        };

        const fieldsToCheck = fieldsByStep[this.currentStep()];
        return fieldsToCheck.every((field) => {
            const control = this.customerForm.get(field);
            return control ? control.valid : true;
        });
    }

    markStepAsTouched() {
        const fieldsByStep: Record<number, string[]> = {
            1: ['name', 'document'],
            2: ['email', 'password', 'phone'],
            3: [
                'zipCode',
                'street',
                'number',
                'complement',
                'neighborhood',
                'city',
                'state',
            ],
            4: ['group', 'newsletter', 'notes'],
        };

        const fieldsToCheck = fieldsByStep[this.currentStep()];
        fieldsToCheck.forEach((field) => {
            this.customerForm.get(field)?.markAsTouched();
        });
    }

    getStepCircleClass(stepId: number): string {
        if (this.currentStep() > stepId) {
            return 'bg-emerald-500 border-none';
        } else if (this.currentStep() === stepId) {
            return 'bg-emerald-50 border-2 border-emerald-200';
        }
        return 'bg-white border-2 border-gray-200';
    }

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
                        state: dados.uf,
                    });
                }
            },
            error: () => this.toastr.error('Erro ao buscar CEP.'),
            complete: () => this.isLoadingCep.set(false),
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.customerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit() {
        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            this.toastr.warning('Existem campos inválidos no formulário.');
            return;
        }

        this.isLoading.set(true);
        const val = this.customerForm.value;

        const payload: any = {
            nome: val.name,
            email: val.email,
            cpf: val.document.replace(/\D/g, ''),
            telefone: val.phone,
            endereco: {
                cep: val.zipCode.replace(/\D/g, ''),
                logradouro: val.street,
                numero: val.number,
                complemento: val.complement,
                bairro: val.neighborhood,
                cidade: val.city,
                uf: val.state,
            },
        };

        if (val.password) {
            payload.senha = val.password;
        }

        const request$: Observable<any> =
            this.isEditing() && this.customerId()
                ? this.usuarioService.atualizarCliente(
                      this.customerId()!,
                      payload,
                  )
                : this.authService.register(payload as RegisterRequest);

        request$.subscribe({
            next: () => {
                this.toastr.success(
                    `Cliente ${this.isEditing() ? 'atualizado' : 'cadastrado'} com sucesso!`,
                );
                localStorage.removeItem(this.DRAFT_KEY);
                this.router.navigate(['/dashboard-admin/clientes']);
            },
            error: (err: any) => {
                // CORREÇÃO: Tipando o 'err' como 'any' explicitamente
                this.toastr.error(
                    err.error?.message || 'Erro ao processar cliente.',
                );
                this.isLoading.set(false);
            },
        });
    }
}
