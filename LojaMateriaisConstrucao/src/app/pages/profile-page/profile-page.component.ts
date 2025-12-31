import { Component } from '@angular/core';
import { Order, Address } from '../../shared/interfaces/Order';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile-page',
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.css'
})

export class ProfilePageComponent {
    // Controle de Estado
    activeSection: 'personal' | 'orders' | 'addresses' | 'wallet' = 'personal';
    showToast = false;
    toastMessage = '';
    
    // Dados Mockados - Usuário
    user = {
        name: 'Carlos Silva',
        cpf: '***.456.789-**',
        email: 'carlos.silva@email.com',
        phone: '(11) 98765-4321',
        memberSince: '2023',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff&size=128'
    };
    
    // Dados Mockados - Pedidos
    orders: Order[] = [
        {
            id: '12345',
            date: 'Realizado em 15 de Out, 2023',
            status: 'Entregue',
            statusColor: 'bg-green-500',
            statusBg: 'bg-green-100 border-green-200',
            statusText: 'text-green-700',
            total: 459.90,
            itemsCount: 4, // 2 imagens + 2 escondidas
            images: [
                'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150&q=80',
                'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&q=80'
            ],
            actionLabel: 'Comprar Novamente'
        },
        {
            id: '12399',
            date: 'Realizado em 28 de Dez, 2023',
            status: 'Em Trânsito',
            statusColor: 'bg-blue-500',
            statusBg: 'bg-blue-100 border-blue-200',
            statusText: 'text-blue-700',
            total: 129.90,
            itemsCount: 1,
            images: [
                'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&q=80'
            ],
            actionLabel: 'Rastrear'
        }
    ];
    
    // Dados Mockados - Endereços
    addresses: Address[] = [
        {
            id: 1,
            label: 'Casa',
            street: 'Rua das Flores, 123 - Centro',
            city: 'São Paulo - SP',
            zip: '01000-000',
            isMain: true
        }
    ];
    
    // Métodos
    setActiveSection(section: 'personal' | 'orders' | 'addresses' | 'wallet') {
        this.activeSection = section;
    }
    
    savePersonalData(event: Event) {
        event.preventDefault();
        this.displayToast('Dados atualizados com sucesso!');
    }
    
    logout() {
        // Lógica real de logout iria aqui
        alert('Logout acionado');
    }
    
    private displayToast(msg: string) {
        this.toastMessage = msg;
        this.showToast = true;
        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }
}
