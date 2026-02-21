import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Stat, ValuePillar } from '../../../shared/interfaces/AboutUs';

@Component({
    selector: 'app-about-us-page',
    imports: [CommonModule],
    templateUrl: './about-us-page.component.html',
    styleUrl: './about-us-page.component.css',
})
export class AboutUsPageComponent {
    stats = signal<Stat[]>([
        { value: '+5.000', label: 'Clientes Satisfeitos' },
        { value: 'Nacional', label: 'Entrega Garantida' },
        { value: '24/7', label: 'Suporte Online' },
        { value: 'Premium', label: 'Curadoria de Itens' },
    ]);

    values = signal<ValuePillar[]>([
        {
            icon: 'ph-magnifying-glass',
            title: 'Seleção Rigorosa',
            description:
                'Nosso esforço (Nitor) está na curadoria. Analisamos centenas de opções para trazer apenas o que une funcionalidade real e design duradouro.',
            colorClass: 'bg-blue-100 group-hover:bg-blue-600 text-blue-600',
        },
        {
            icon: 'ph-squares-four',
            title: 'Variedade Inteligente',
            description:
                'Não se trata de ter tudo, mas de ter o necessário. De soluções para casa a gadgets modernos, focamos na utilidade para o seu dia a dia.',
            colorClass:
                'bg-orange-100 group-hover:bg-orange-600 text-orange-600',
        },
        {
            icon: 'ph-sparkle',
            title: 'Experiência Premium',
            description:
                'O brilho do resultado. Garantimos uma jornada de compra fluida, envio cuidadoso e a certeza de adquirir um produto que faz a diferença.',
            colorClass: 'bg-brand-100 group-hover:bg-brand-600 text-brand-600',
        },
    ]);
}
