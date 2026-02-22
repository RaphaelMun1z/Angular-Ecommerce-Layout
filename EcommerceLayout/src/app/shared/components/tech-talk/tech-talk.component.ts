import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface BlogPost {
    id: string;
    title: string;
    excerpt?: string;
    category: string;
    author?: string;
    date: string;
    imageUrl?: string;
}

@Component({
    selector: 'app-tech-talk',
    imports: [CommonModule],
    templateUrl: './tech-talk.component.html',
    styleUrl: './tech-talk.component.css',
})
export class TechTalkComponent {
    // Post Principal (Destaque)
    featuredPost: BlogPost = {
        id: '1',
        title: 'Nossas Escolhas dos 10 Melhores Gadgets',
        excerpt:
            'Descubra os equipamentos tecnológicos mais inovadores que vão dominar o mercado neste ano. Lista feita especialmente por nossos especialistas em tecnologia.',
        category: 'Gadgets',
        author: 'Damian Growth',
        date: '12 de Abril, 2026',
        imageUrl:
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    };

    // Posts Secundários (Lista lateral)
    secondaryPosts: BlogPost[] = [
        {
            id: '2',
            title: 'Alta Qualidade vs Preço: Por que investir em uma Smart TV?',
            category: 'Análise',
            date: '15 de Abril, 2026',
        },
        {
            id: '3',
            title: 'Como Escolher o Notebook Ideal: Nosso Especialista Conta',
            category: 'Dicas',
            date: '12 de Abril, 2026',
        },
        {
            id: '4',
            title: 'O Futuro das Casas Inteligentes: Um Olhar Sobre a Tecnologia',
            category: 'Tendências',
            date: '2 de Abril, 2026',
        },
    ];
}
