import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-my-account-area',
    imports: [CommonModule, RouterLink],
    templateUrl: './my-account-area.component.html',
    styleUrl: './my-account-area.component.css'
})
export class MyAccountAreaComponent {
    public authService = inject(AuthService);
    
    isMenuOpen = signal(false);
    
    user = this.authService.currentUser;
    isAdmin = this.authService.isAdmin;
    
    userName = computed(() => {
        const u = this.user();
        if (u?.name) return u.name.split(' ')[0];
        return u?.email?.split('@')[0] || 'Minha Conta';
    });
    
    userAvatar = computed(() => {
        const u = this.user();
        if (u?.avatar) {
            return u.avatar;
        }
        const identifier = this.userName();
        return `https://ui-avatars.com/api/?name=${identifier}&background=0f172a&color=fff&size=128`;
    });
    
    toggleMenu() {
        this.isMenuOpen.update(v => !v);
    }
    
    onMouseEnter() { this.isMenuOpen.set(true); }
    onMouseLeave() { this.isMenuOpen.set(false); }
    
    logout() {
        this.authService.logout();
        this.isMenuOpen.set(false);
    }
    
    handleImageError(event: any) {
        event.target.src = `https://ui-avatars.com/api/?name=${this.userName()}&background=0f172a&color=fff&size=128`;
    }
}
