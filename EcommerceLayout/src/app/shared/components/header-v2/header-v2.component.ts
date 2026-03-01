import {
    Component,
    ElementRef,
    HostListener,
    inject,
    OnInit,
    signal,
    computed,
} from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';
import { CentralSearchBarComponent } from '../header/central-search-bar/central-search-bar.component';
import { LogoMenuMobileTriggerComponent } from '../header/logo-menu-mobile-trigger/logo-menu-mobile-trigger.component';
import { MyAccountAreaComponent } from '../header/my-account-area/my-account-area.component';
import { WrapperCartComponent } from '../header/wrapper-cart/wrapper-cart.component';
import { Categoria } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';

@Component({
    selector: 'app-header-v2',
    imports: [
        CentralSearchBarComponent,
        LogoMenuMobileTriggerComponent,
        WrapperCartComponent,
        MyAccountAreaComponent,
        RouterLink,
    ],
    templateUrl: './header-v2.component.html',
    styleUrl: './header-v2.component.css',
})
export class HeaderV2Component implements OnInit {
    public authService = inject(AuthService);
    private elementRef = inject(ElementRef);
    private catalogoService = inject(CatalogoService);

    isMobileSearchOpen = signal(false);
    isCategoryMenuOpen = signal(false);

    categorias = signal<Categoria[]>([]);

    scrollY = signal(0);
    isSticky = computed(() => this.scrollY() > 300);

    ngOnInit(): void {
        this.carregarCategorias();
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        this.scrollY.set(window.scrollY);
    }

    carregarCategorias(): void {
        this.catalogoService.listarCategoriasAtivas({ size: 20 }).subscribe({
            next: (pagina) => {
                this.categorias.set(pagina.content || []);
            },
            error: (erro) => {
                console.error('Erro ao buscar categorias para o menu', erro);
            },
        });
    }

    openMobileSearch() {
        this.isMobileSearchOpen.set(true);
    }

    closeMobileSearch() {
        this.isMobileSearchOpen.set(false);
    }

    toggleCategoryMenu(event: Event) {
        event.stopPropagation();
        this.isCategoryMenuOpen.update((val) => !val);
    }

    @HostListener('document:click', ['$event'])
    closeMenusOnClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isCategoryMenuOpen.set(false);
        }
    }
}
