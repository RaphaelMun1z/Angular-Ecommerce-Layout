import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { CarrinhoService } from '../../../../services/carrinho.service';

@Component({
    selector: 'app-shopping-cart-popup',
    imports: [CommonModule, RouterLink],
    templateUrl: './shopping-cart-popup.component.html',
    styleUrl: './shopping-cart-popup.component.css'
})
export class ShoppingCartPopupComponent {
    carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);
    
    removerItem(event: Event, produtoId: string) {
        event.stopPropagation(); 
        const clienteId = this.authService.currentUser()?.id;
        
        if (clienteId) {
            this.carrinhoService.removerItem(clienteId, produtoId).subscribe();
        }
    }
}
