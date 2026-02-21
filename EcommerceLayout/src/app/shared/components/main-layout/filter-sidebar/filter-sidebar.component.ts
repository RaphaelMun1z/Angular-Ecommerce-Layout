import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { Categoria, ProdutoFiltro } from '../../../../models/catalogo.models';
import { CatalogoService } from '../../../../services/catalogo.service';
import { SystemStatusService } from '../../../../services/systemStatus.service';

@Component({
    selector: 'app-filter-sidebar',
    imports: [CommonModule, FormsModule, NgxSliderModule],
    templateUrl: './filter-sidebar.component.html',
    styleUrl: './filter-sidebar.component.css'
})

export class FilterSidebarComponent implements OnInit {
    private catalogoService = inject(CatalogoService);
    public systemStatus = inject(SystemStatusService);
    
    categories = signal<Categoria[]>([]);
    isLoading = signal(false);
    
    sliderOptions: Options = {
        floor: 0,
        ceil: 10000,
        step: 50,
        translate: (value: number): string => {
            return 'R$' + value;
        }
    };
    
    sections = {
        categories: true,
        price: true,
        availability: true
    };
    
    filters: ProdutoFiltro = {
        categoriaId: '',
        precoMin: 0,
        precoMax: 10000,
        apenasAtivos: true
    };
    
    inStockOnly = false;
    
    @Output() filterChange = new EventEmitter<ProdutoFiltro>();
    @Output() close = new EventEmitter<void>();
    
    ngOnInit() {
        this.loadCategories();
    }
    
    loadCategories() {
        if (this.systemStatus.isSystemOffline()) return;
        
        this.isLoading.set(true);
        this.catalogoService.listarCategoriasAtivas({ page: 0, size: 100 }).subscribe({
            next: (page) => {
                this.categories.set(page.content);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar categorias', err);
                this.isLoading.set(false);
                if (err.status === 0) {
                    this.systemStatus.checkHealth();
                }
            }
        });
    }
    
    toggleSection(section: keyof typeof this.sections) {
        this.sections[section] = !this.sections[section];
    }
    
    onCategoryChange(categoryId: string) {
        if (this.filters.categoriaId === categoryId) {
            this.filters.categoriaId = '';
        } else {
            this.filters.categoriaId = categoryId;
        }
        this.emitFilters();
    }
    
    onFilterChange() {
        this.emitFilters();
    }
    
    onAvailabilityChange() {
        this.emitFilters();
    }
    
    resetFilters() {
        this.filters = {
            categoriaId: '',
            precoMin: 0,
            precoMax: 10000,
            apenasAtivos: true
        };
        this.inStockOnly = false;
        this.emitFilters();
    }
    
    private emitFilters() {
        const filtersToEmit: ProdutoFiltro = {
            categoriaId: this.filters.categoriaId || undefined,
            precoMin: this.filters.precoMin,
            precoMax: this.filters.precoMax,
            apenasAtivos: true,
            termo: this.filters.termo
        };
        
        this.filterChange.emit(filtersToEmit);
    }
    
    retry() {
        this.systemStatus.checkHealth();
        this.loadCategories();
    }
}