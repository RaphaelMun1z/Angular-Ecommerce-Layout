import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Categoria, ProdutoRequest } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import {
    TipoMovimentacao,
    MovimentacaoEstoqueRequest,
} from '../../../models/estoque.models';
import { EstoqueService } from '../../../services/estoque.service';
import { FileUploadService } from '../../../services/fileUpload.service';
import { HttpResponse } from '@angular/common/http';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'app-register-product-page',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register-product-page.component.html',
    styleUrl: './register-product-page.component.css',
})
export class RegisterProductPageComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private catalogoService = inject(CatalogoService);
    private estoqueService = inject(EstoqueService);
    private fileUploadService = inject(FileUploadService);
    private toastr = inject(ToastrService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private destroy$ = new Subject<void>();

    // Chave do LocalStorage
    private readonly DRAFT_KEY = 'admin_product_draft';

    // Estados e Modais
    isLoading = signal(false);
    isAdjustingStock = signal(false);
    isUploading = signal(false);
    isEditing = signal(false);
    showStockModal = signal(false);
    
    productId = signal<string | null>(null);
    categorias = signal<Categoria[]>([]);
    images = signal<string[]>([]);

    // Estados do Wizard
    currentStep = signal(1);

    steps = [
        { id: 1, title: 'Informações Gerais', desc: 'Nome e descrição que o cliente verá.', icon: 'ph-text-t' },
        { id: 2, title: 'Galeria de Mídia', desc: 'Fotos ajudam a converter mais vendas.', icon: 'ph-image' },
        { id: 3, title: 'Classificação e Fisíco', desc: 'Dados para logística e organização.', icon: 'ph-tag' },
        { id: 4, title: 'Valores e Estoque', desc: 'Precificação e disponibilidade inicial.', icon: 'ph-currency-dollar' }
    ];

    currentStepData = computed(() => this.steps.find(s => s.id === this.currentStep()) || this.steps[0]);

    // Formulário do Produto
    productForm: FormGroup = this.fb.group({
        // Passo 1
        titulo: ['', [Validators.required, Validators.minLength(3)]],
        descricao: ['', [Validators.required]],
        // Passo 3
        codigoControle: ['', [Validators.required, Validators.minLength(3)]],
        categoriaId: ['', Validators.required],
        ativo: [true, Validators.required],
        pesoKg: [null],
        dimensoes: [''],
        // Passo 4
        preco: [null, [Validators.required, Validators.min(0.01)]],
        precoPromocional: [null, [Validators.min(0)]],
        estoque: [0, [Validators.required, Validators.min(0)]]
    });

    // Formulário de Estoque
    stockForm: FormGroup = this.fb.group({
        quantidade: [1, [Validators.required, Validators.min(1)]],
        tipo: [TipoMovimentacao.ENTRADA, Validators.required],
        motivo: ['', [Validators.required, Validators.minLength(5)]],
    });

    ngOnInit() {
        this.carregarCategorias();

        this.route.queryParams.subscribe((params) => {
            const id = params['id'];
            if (id) {
                this.productId.set(id);
                this.isEditing.set(true);
                this.carregarDadosProduto(id);
            } else {
                this.loadDraft();
            }
        });

        // Configura o Auto-Save de rascunho
        this.productForm.valueChanges
            .pipe(debounceTime(500), takeUntil(this.destroy$))
            .subscribe(() => this.saveDraft());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // --- AUTO SAVE E RASCUNHOS ---
    
    private saveDraft() {
        // Se estiver editando um produto, nunca salvamos rascunho para não bugar dados reais.
        if (this.isEditing()) return;
        
        const draftObj = {
            form: this.productForm.value,
            images: this.images()
        };
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draftObj));
    }

    private loadDraft() {
        const draftStr = localStorage.getItem(this.DRAFT_KEY);
        if (draftStr) {
            try {
                const parsed = JSON.parse(draftStr);
                if (parsed.form) this.productForm.patchValue(parsed.form, { emitEvent: false });
                if (parsed.images) this.images.set(parsed.images);
            } catch (e) {
                console.error('Erro ao processar rascunho', e);
            }
        }
    }

    // --- LÓGICA DO WIZARD ---

    nextStep() {
        if (this.isCurrentStepValid()) {
            this.currentStep.set(this.currentStep() + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.toastr.warning('Preencha os campos obrigatórios corretamente.', 'Atenção');
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
            1: ['titulo', 'descricao'],
            2: [], // Imagens não acionam erro duro que impeça avanço
            3: ['codigoControle', 'categoriaId', 'ativo'],
            4: ['preco', 'estoque']
        };

        const fieldsToCheck = fieldsByStep[this.currentStep()];
        return fieldsToCheck.every(field => {
            const control = this.productForm.get(field);
            return control ? control.valid : true;
        });
    }

    markStepAsTouched() {
        const fieldsByStep: Record<number, string[]> = {
            1: ['titulo', 'descricao'],
            2: [],
            3: ['codigoControle', 'categoriaId', 'pesoKg', 'dimensoes'],
            4: ['preco', 'precoPromocional', 'estoque']
        };

        const fieldsToCheck = fieldsByStep[this.currentStep()];
        fieldsToCheck.forEach(field => {
            this.productForm.get(field)?.markAsTouched();
        });
    }

    getStepCircleClass(stepId: number): string {
        if (this.currentStep() > stepId) {
            return 'bg-[#5252FF] border-none'; // Concluído
        } else if (this.currentStep() === stepId) {
            return 'bg-[#5252FF]/10 border-2 border-[#5252FF]/30'; // Atual
        }
        return 'bg-white border-2 border-gray-200'; // Pendente
    }

    // --- CARREGAMENTO DE DADOS ---

    carregarCategorias() {
        this.catalogoService
            .listarCategoriasAtivas({ page: 0, size: 100 })
            .subscribe({
                next: (page) => this.categorias.set(page.content),
            });
    }

    carregarDadosProduto(id: string) {
        this.isLoading.set(true);
        this.catalogoService.obterProduto(id).subscribe({
            next: (produto) => {
                this.productForm.patchValue({
                    codigoControle: produto.codigoControle,
                    titulo: produto.titulo,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    precoPromocional: produto.precoPromocional,
                    estoque: produto.estoque,
                    ativo: produto.ativo,
                    categoriaId: produto.categoria?.id,
                    pesoKg: produto.pesoKg,
                    dimensoes: produto.dimensoes,
                });

                if (produto.imagens && produto.imagens.length > 0) {
                    const urls = produto.imagens
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((img) => img.url);
                    this.images.set(urls);
                }

                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Erro ao carregar dados do produto.');
                this.router.navigate(['/dashboard-admin/produtos']);
            },
        });
    }

    // --- UPLOAD DE IMAGENS ---

    onFileSelected(event: any) {
        const files: FileList = event.target.files;
        if (files && files.length > 0) {
            this.isUploading.set(true);
            let uploadCount = 0;
            const totalFiles = files.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = files[i];

                if (!file.type.startsWith('image/')) {
                    this.toastr.warning(`Arquivo ${file.name} ignorado (não é imagem).`);
                    uploadCount++;
                    this.checkUploadComplete(uploadCount, totalFiles);
                    continue;
                }

                this.fileUploadService.upload(file).subscribe({
                    next: (event) => {
                        if (event instanceof HttpResponse) {
                            const response = event.body as any;
                            if (response && response.url) {
                                this.images.update((imgs) => [...imgs, response.url]);
                                this.saveDraft(); // Salvar rascunho com a nova imagem
                            }
                            uploadCount++;
                            this.checkUploadComplete(uploadCount, totalFiles);
                        }
                    },
                    error: (err) => {
                        console.error(err);
                        this.toastr.error(`Erro ao enviar ${file.name}`);
                        uploadCount++;
                        this.checkUploadComplete(uploadCount, totalFiles);
                    },
                });
            }
        }
    }

    private checkUploadComplete(current: number, total: number) {
        if (current === total) {
            this.isUploading.set(false);
            this.toastr.success('Processamento de imagens concluído!');
        }
    }

    removeImage(index: number) {
        this.images.update((imgs) => imgs.filter((_, i) => i !== index));
        this.saveDraft();
    }

    // --- SUBMISSÃO E ESTOQUE ---

    isFieldInvalid(fieldName: string): boolean {
        const field = this.productForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            this.toastr.warning('Preencha todos os campos obrigatórios em todas as abas.');
            return;
        }

        this.isLoading.set(true);
        const formValue = this.productForm.value;

        const request: ProdutoRequest = {
            codigoControle: formValue.codigoControle,
            titulo: formValue.titulo,
            descricao: formValue.descricao,
            preco: formValue.preco,
            precoPromocional: formValue.precoPromocional || undefined,
            estoque: formValue.estoque,
            ativo: formValue.ativo,
            categoriaId: formValue.categoriaId,
            pesoKg: formValue.pesoKg,
            dimensoes: formValue.dimensoes,
            imagens: this.images(),
        };

        const operation$ =
            this.isEditing() && this.productId()
                ? this.catalogoService.atualizarProduto(this.productId()!, request)
                : this.catalogoService.salvarProduto(request);

        operation$.subscribe({
            next: () => {
                this.toastr.success(`Produto ${this.isEditing() ? 'atualizado' : 'cadastrado'} com sucesso!`);
                localStorage.removeItem(this.DRAFT_KEY);
                this.router.navigate(['/dashboard-admin/produtos']);
            },
            error: (err) => {
                this.toastr.error(err.error?.message || 'Erro ao processar solicitação.');
                this.isLoading.set(false);
            },
        });
    }

    openStockModal(product: any) {
        this.stockForm.reset({
            quantidade: 1,
            tipo: TipoMovimentacao.ENTRADA,
            motivo: '',
        });
        this.showStockModal.set(true);
    }

    confirmStockAdjustment() {
        if (this.stockForm.invalid || !this.productId()) {
            this.stockForm.markAllAsTouched();
            return;
        }

        this.isAdjustingStock.set(true);
        const val = this.stockForm.value;
        const request: MovimentacaoEstoqueRequest = {
            produtoId: this.productId()!,
            quantidade: val.quantidade,
            tipo: val.tipo,
            motivo: val.motivo,
        };

        this.estoqueService.registrarMovimentacao(request).subscribe({
            next: () => {
                this.toastr.success('Estoque atualizado com sucesso!');
                this.stockForm.reset({ quantidade: 1, tipo: TipoMovimentacao.ENTRADA, motivo: '' });
                this.showStockModal.set(false);
                this.carregarDadosProduto(this.productId()!);
            },
            error: (err) => this.toastr.error(err.error?.message || 'Erro ao ajustar estoque.'),
            complete: () => this.isAdjustingStock.set(false),
        });
    }

    get enumTipo() {
        return TipoMovimentacao;
    }
}