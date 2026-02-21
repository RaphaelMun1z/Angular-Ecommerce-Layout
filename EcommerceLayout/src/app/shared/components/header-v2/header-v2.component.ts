import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';
import { CentralSearchBarComponent } from '../header/central-search-bar/central-search-bar.component';
import { LogoMenuMobileTriggerComponent } from '../header/logo-menu-mobile-trigger/logo-menu-mobile-trigger.component';
import { MyAccountAreaComponent } from '../header/my-account-area/my-account-area.component';
import { WrapperCartComponent } from '../header/wrapper-cart/wrapper-cart.component';

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
export class HeaderV2Component {
    public authService = inject(AuthService);
    private elementRef = inject(ElementRef);
    
    isMobileSearchOpen = signal(false);
    isCategoryMenuOpen = signal(false);
    isProductMenuOpen = signal(false);

    openMobileSearch() {
        this.isMobileSearchOpen.set(true);
    }

    closeMobileSearch() {
        this.isMobileSearchOpen.set(false);
    }

    toggleCategoryMenu(event: Event) {
        event.stopPropagation();
        this.isCategoryMenuOpen.update(val => !val);
        this.isProductMenuOpen.set(false);
    }

    toggleProductMenu(event: Event) {
        event.stopPropagation();
        this.isProductMenuOpen.update(val => !val);
        this.isCategoryMenuOpen.set(false);
    }

    @HostListener('document:click', ['$event'])
    closeMenusOnClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isCategoryMenuOpen.set(false);
            this.isProductMenuOpen.set(false);
        }
    }
}
