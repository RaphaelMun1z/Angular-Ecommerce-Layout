import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogoService } from '../../../services/catalogo.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../../models/catalogo.models';

@Component({
    selector: 'app-register-category-page',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register-category-page.component.html',
    styleUrl: './register-category-page.component.css',
})
export class RegisterCategoryPageComponent implements OnInit {
    private fb = inject(FormBuilder);
  private catalogoService = inject(CatalogoService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentStep = signal(1);
  isLoading = signal(false);
  isEditMode = signal(false);
  categoryId = signal<string | null>(null);
  
  // Lista para o select de Categoria Pai
  parentCategories = signal<Categoria[]>([]);

  steps = [
    { id: 1, title: 'Identificação', desc: 'Nome, slug e hierarquia', icon: 'ph-tag' },
    { id: 2, title: 'Conteúdo', desc: 'Descrição detalhada', icon: 'ph-text-align-left' },
    { id: 3, title: 'Finalização', desc: 'Revisão e publicação', icon: 'ph-rocket-launch' }
  ];

  categoryForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    slug: ['', [Validators.required]],
    descricao: ['', [Validators.maxLength(500)]],
    categoriaPaiId: [null],
    ativa: [true]
  });

  currentStepData = computed(() => this.steps[this.currentStep() - 1]);

  ngOnInit() {
    this.loadInitialData();
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.categoryId.set(id);
      this.loadCategoryData(id);
    }

    // Auto-gera o slug quando o nome muda
    this.categoryForm.get('nome')?.valueChanges.subscribe(name => {
      if (!this.isEditMode()) {
        this.generateSlug(name);
      }
    });
  }

  loadInitialData() {
    this.catalogoService.listarCategoriasAtivas({ size: 100 }).subscribe({
      next: (page) => this.parentCategories.set(page.content)
    });
  }

  loadCategoryData(id: string) {
    this.isLoading.set(true);
    this.catalogoService.obterCategoria(id).subscribe({
      next: (cat) => {
        this.categoryForm.patchValue(cat);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro', 'Falha ao buscar dados.');
        this.router.navigate(['/dashboard-admin/categorias']);
      }
    });
  }

  generateSlug(name: string) {
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '-') // Remove caracteres especiais
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início/fim
    this.categoryForm.patchValue({ slug }, { emitEvent: false });
  }

  nextStep() {
    const step1Fields = ['nome', 'slug'];
    if (this.currentStep() === 1) {
      let invalid = false;
      step1Fields.forEach(f => {
        if (this.categoryForm.get(f)?.invalid) {
          this.categoryForm.get(f)?.markAsTouched();
          invalid = true;
        }
      });
      if (invalid) return;
    }
    if (this.currentStep() < this.steps.length) this.currentStep.update(s => s + 1);
  }

  prevStep() {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  getStepCircleClass(stepId: number): string {
    if (this.currentStep() > stepId) return 'bg-[#f45b49] border-[#f45b49] text-white';
    if (this.currentStep() === stepId) return 'bg-white border-[#f45b49] text-[#f45b49]';
    return 'bg-white border-gray-200 text-gray-400';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.categoryForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const id = this.categoryId();
    const request = this.isEditMode() 
      ? this.catalogoService.atualizarCategoria(id!, this.categoryForm.value)
      : this.catalogoService.salvarCategoria(this.categoryForm.value);

    request.subscribe({
      next: () => {
        this.toastService.success('Sucesso', 'Operação realizada!');
        this.router.navigate(['/dashboard-admin/categorias']);
      },
      error: (err) => {
        this.toastService.error('Erro', err.error?.message || 'Falha ao salvar.');
        this.isLoading.set(false);
      }
    });
  }
}
