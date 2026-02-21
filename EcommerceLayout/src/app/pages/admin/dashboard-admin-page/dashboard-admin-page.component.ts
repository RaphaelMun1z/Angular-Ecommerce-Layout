import { Component, computed, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-dashboard-admin-page',
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './dashboard-admin-page.component.html',
    styleUrl: './dashboard-admin-page.component.css'
})

export class DashboardAdminPageComponent {
    public authService = inject(AuthService);
    public config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'dark';
    
    isSidebarOpen = signal(false);
    
    adminUser = computed(() => this.authService.currentUser());
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }
    
    logout() {
        this.authService.logout();
    }
}
