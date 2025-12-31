import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FavoriteItem } from '../../shared/interfaces/FavoriteItem';

@Component({
    selector: 'app-my-favorite-products-page',
    imports: [CommonModule],
    templateUrl: './my-favorite-products-page.component.html',
    styleUrl: './my-favorite-products-page.component.css'
})

export class MyFavoriteProductsPageComponent {
    // Estado
    favorites = signal<FavoriteItem[]>([
        {
            id: 1,
            name: 'Argamassa Piso sobre Piso 20kg Quartzolit',
            category: 'Cimento & Argamassa',
            price: 29.90,
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300',
            inStock: true
        },
        {
            id: 2,
            name: 'Serra Mármore 1300W Bosch GDC 150',
            category: 'Ferramentas',
            price: 459.00,
            image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300',
            inStock: true
        },
        {
            id: 3,
            name: 'Tinta Acrílica Fosca 18L Branco Coral',
            category: 'Pintura',
            price: 389.90,
            image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300',
            inStock: true
        },
        {
            id: 4,
            name: 'Furadeira de Impacto 1/2" 650W Mondial',
            category: 'Ferramentas',
            price: 149.90,
            image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300',
            inStock: false
        },
        {
            id: 5,
            name: 'Kit Jogo de Chaves Combinadas 6 a 22mm',
            category: 'Ferramentas Manuais',
            price: 89.90,
            image: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=300',
            inStock: true
        }
    ]);
    
    // Toast
    showToast = signal(false);
    toastMessage = signal('');
    toastTimeout: any;
    
    removeFavorite(id: number) {
        this.favorites.update(items => items.filter(item => item.id !== id));
        this.displayToast('Removido dos favoritos');
    }
    
    clearAll() {
        if(confirm('Limpar lista de favoritos?')) {
            this.favorites.set([]);
            this.displayToast('Lista limpa');
        }
    }
    
    addToCart(item: FavoriteItem) {
        this.displayToast('Adicionado à sacola');
    }
    
    private displayToast(msg: string) {
        this.toastMessage.set(msg);
        this.showToast.set(true);
        
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        
        this.toastTimeout = setTimeout(() => {
            this.showToast.set(false);
        }, 2000); // Toast mais rápido
    }
}
