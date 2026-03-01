import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageableParams } from '../../../models/shared.models';
import { Categoria } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-admin-categories-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './admin-categories-page.component.html',
    styleUrl: './admin-categories-page.component.css'
})
export class AdminCategoriesPageComponent implements OnInit {
    private catalogoService = inject(CatalogoService);
    private toastService = inject(ToastService);

    isLoading = signal(true);
    searchTerm = signal('');
    
    categories = signal<Categoria[]>([]);
    totalElements = signal(0);
    currentPage = signal(0);
    pageSize = signal(10);

    totalPages = computed(() => {
        const total = Number(this.totalElements());
        const size = Number(this.pageSize());
        return total && size ? Math.ceil(total / size) : 0;
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const maxVisible = 5;
        if (total <= 0) return [];
        let start = Math.max(0, current - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible);
        if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
        return Array.from({ length: end - start }, (_, i) => start + i);
    });

    ngOnInit() {
        this.loadCategories();
    }

    onSearch(term: string) {
        this.searchTerm.set(term);
        this.currentPage.set(0);
        this.loadCategories();
    }

    updatePageSize(newSize: string | number) {
        this.pageSize.set(Number(newSize));
        this.currentPage.set(0);
        this.loadCategories();
    }

    goToPage(page: number) {
        this.currentPage.set(page);
        this.loadCategories();
    }

    loadCategories() {
        this.isLoading.set(true);
        const params: PageableParams = {
            page: this.currentPage(),
            size: this.pageSize(),
            sort: 'nome,asc'
        };

        // Utilizando o método que lista todas (admin)
        this.catalogoService.listarTodasCategorias(params).subscribe({
            next: (page) => {
                this.categories.set(page.content || []);
                this.totalElements.set(page.totalElements || 0);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastService.error('Erro', 'Não foi possível carregar as categorias.');
                this.isLoading.set(false);
            }
        });
    }

    toggleStatus(category: Categoria) {
        const action = category.ativa ? this.catalogoService.desativarCategoria(category.id) : this.catalogoService.ativarCategoria(category.id);
        
        action.subscribe({
            next: () => {
                this.toastService.success('Sucesso', `Categoria ${category.ativa ? 'desativada' : 'ativada'}!`);
                this.loadCategories();
            },
            error: () => this.toastService.error('Erro', 'Falha ao alterar status.')
        });
    }

    deleteCategory(category: Categoria) {
        if (confirm(`Excluir permanentemente a categoria "${category.nome}"?`)) {
            this.catalogoService.excluirCategoria(category.id).subscribe({
                next: () => {
                    this.toastService.success('Removido', 'Categoria excluída com sucesso.');
                    this.loadCategories();
                },
                error: (err) => this.toastService.error('Erro', err.error?.message || 'Erro ao excluir.')
            });
        }
    }
}