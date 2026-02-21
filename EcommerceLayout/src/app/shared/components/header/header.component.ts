import { Component, inject, signal } from '@angular/core';
import { CentralSearchBarComponent } from './central-search-bar/central-search-bar.component';
import { LogoMenuMobileTriggerComponent } from './logo-menu-mobile-trigger/logo-menu-mobile-trigger.component';
import { WrapperCartComponent } from './wrapper-cart/wrapper-cart.component';
import { MyAccountAreaComponent } from './my-account-area/my-account-area.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-header',
    imports: [
        CentralSearchBarComponent,
        LogoMenuMobileTriggerComponent,
        WrapperCartComponent,
        MyAccountAreaComponent,
        RouterLink,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    public authService = inject(AuthService);
    isMobileSearchOpen = signal(false);

    openMobileSearch() {
        this.isMobileSearchOpen.set(true);
    }

    closeMobileSearch() {
        this.isMobileSearchOpen.set(false);
    }
}
