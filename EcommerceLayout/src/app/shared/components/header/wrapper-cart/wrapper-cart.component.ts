import { Component, effect, inject } from '@angular/core';
import { ShoppingCartPopupComponent } from '../shopping-cart-popup/shopping-cart-popup.component';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../../../core/auth/auth.service';
import { CarrinhoService } from '../../../../services/carrinho.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-wrapper-cart',
    imports: [ShoppingCartPopupComponent, RouterLink, CommonModule],
    templateUrl: './wrapper-cart.component.html',
    styleUrl: './wrapper-cart.component.css'
})

export class WrapperCartComponent {
    carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);
    
    constructor() {
        effect(() => {
            const user = this.authService.currentUser();
            if (user?.id) {
                this.carrinhoService.carregarCarrinho(user.id);
            } else {
                this.carrinhoService.limparEstadoLocal();
            }
        });
    }
}
