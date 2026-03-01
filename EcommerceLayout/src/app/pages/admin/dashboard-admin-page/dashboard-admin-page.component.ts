import { Component, computed, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-dashboard-admin-page',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './dashboard-admin-page.component.html',
    styleUrl: './dashboard-admin-page.component.css'
})
export class DashboardAdminPageComponent {
    public authService = inject(AuthService);
    public config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'dark';
    isSidebarOpen = signal(false);
    
    user = this.authService.currentUser;

    userName = computed(() => {
        const u = this.user();
        if (u?.name) return u.name.split(' ')[0];
        return u?.email?.split('@')[0] || 'Admin';
    });

    userAvatar = computed(() => {
        const u = this.user();
        if (u?.avatar) return u.avatar;
        
        return `https://ui-avatars.com/api/?name=${this.userName()}&background=f45b49&color=fff&size=128`;
    });

    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }
    
    logout() {
        this.authService.logout();
    }

    handleImageError(event: any) {
        event.target.src = `https://ui-avatars.com/api/?name=${this.userName()}&background=f45b49&color=fff&size=128`;
    }
}