import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
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
    private elementRef = inject(ElementRef); // Necessário para detectar cliques fora do menu
    
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
        // A cor de fundo do Avatar placeholder agora usa a cor da sua marca (f45b49)
        return `https://ui-avatars.com/api/?name=${identifier}&background=f45b49&color=fff&size=128`;
    });
    
    toggleMenu() {
        this.isMenuOpen.update(v => !v);
    }
    
    // Fecha o popup ao clicar em qualquer lugar fora deste componente
    @HostListener('document:click', ['$event'])
    closeMenuOnClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isMenuOpen.set(false);
        }
    }
    
    logout() {
        this.authService.logout();
        this.isMenuOpen.set(false);
    }
    
    handleImageError(event: any) {
        event.target.src = `https://ui-avatars.com/api/?name=${this.userName()}&background=f45b49&color=fff&size=128`;
    }
}
