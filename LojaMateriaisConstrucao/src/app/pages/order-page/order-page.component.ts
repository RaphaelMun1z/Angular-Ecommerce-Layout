import { Component } from '@angular/core';
import { CartItem, ProductResume, TimelineStep } from '../../shared/interfaces/Cart';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-order-page',
    imports: [CommonModule],
    templateUrl: './order-page.component.html',
    styleUrl: './order-page.component.css'
})

export class OrderPageComponent {
    // Dados do Pedido
    orderId = '12345';
    orderDate = '28 de Dezembro de 2024';
    
    // Configuração da Timeline
    progressPercentage = 75; // Controla a barra laranja
    timelineSteps: TimelineStep[] = [
        { label: 'Realizado', dateOrInfo: '28/12, 10:30', status: 'completed', icon: 'ph-check' },
        { label: 'Aprovado', dateOrInfo: '28/12, 10:35', status: 'completed', icon: 'ph-check' },
        { label: 'Em Trânsito', dateOrInfo: 'Previsão: 05/01', status: 'current', icon: 'ph-truck' },
        { label: 'Entregue', dateOrInfo: '', status: 'pending', icon: 'ph-package' }
    ];
    
    // Itens do Pedido - Adaptados para a interface CartItem
    items: CartItem[] = [
        {
            id: 1,
            category: 'Ferramentas',
            name: 'Furadeira Parafusadeira Impacto 12V',
            quantity: 1,
            price: 289.90,
            stock: 15,
            images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150&q=80']
        },
        {
            id: 2,
            category: 'Cimento & Argamassa',
            name: 'Cimento CP II-E-32 50kg Votorantim',
            quantity: 5,
            price: 174.50,
            stock: 100,
            images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&q=80']
        }
    ];
    
    // Totais
    subtotal = 464.40;
    discount = 20.00;
    total = 444.40;
}
