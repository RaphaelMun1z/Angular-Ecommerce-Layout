import { Component, effect, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/auth.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { Endereco } from '../../../../models/usuario.models';
import { AddressFormComponent } from "../../forms/address-form/address-form.component";

@Component({
    selector: 'app-my-addresses',
    imports: [CommonModule, NgxMaskPipe, AddressFormComponent],
    templateUrl: './my-addresses.component.html',
    styleUrl: './my-addresses.component.css'
})
export class MyAddressesComponent {
    private authService = inject(AuthService);
    private usuarioService = inject(UsuarioService);
    private toastr = inject(ToastrService);
    
    showForm = signal(false);
    editingAddress = signal<any>(null);
    
    isLoading = signal(true);
    hasError = signal(false);
    saveError = signal(false);
    
    addresses = signal<Endereco[]>([]);
    
    constructor() {
        effect(() => {
            const currentUser = this.authService.currentUser();
            if (currentUser?.id) {
                this.carregarEnderecos(currentUser.id);
            }
        });
    }
    
    carregarEnderecos(userId: string) {
        this.isLoading.set(true);
        this.hasError.set(false);
        
        this.usuarioService.listarEnderecos(userId).subscribe({
            next: (lista) => {
                this.addresses.set(lista);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar endereços', err);
                this.hasError.set(true);
                this.isLoading.set(false);
            }
        });
    }
    
    retryLoad() {
        const userId = this.authService.currentUser()?.id;
        if (userId) this.carregarEnderecos(userId);
    }
        
    toggleForm() {
        this.showForm.update(v => !v);
        this.saveError.set(false);
        if (!this.showForm()) {
            this.editingAddress.set(null);
        }
    }
    
    startEdit(address: Endereco) {
        this.editingAddress.set(address);
        this.showForm.set(true);
        this.saveError.set(false);
        
        setTimeout(() => {
            const formElement = document.querySelector('app-address-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
    
    handleSave(addressData: any) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        this.saveError.set(false);
        
        const operation$ = this.editingAddress()
        ? this.usuarioService.atualizarEndereco(this.editingAddress().id, addressData, userId)
        : this.createAddress(addressData, userId);
        
        operation$.subscribe({
            next: () => {
                this.toastr.success(this.editingAddress() ? 'Endereço atualizado!' : 'Novo endereço cadastrado!');
                this.toggleForm();
                this.carregarEnderecos(userId);
            },
            error: (err) => {
                console.error('Erro ao salvar', err);
                this.saveError.set(true);
            }
        });
    }
    
    private createAddress(addressData: any, userId: string) {
        const isFirst = this.addresses().length === 0;
        const newAddress = { ...addressData, principal: addressData.principal || isFirst };
        return this.usuarioService.adicionarEndereco(userId, newAddress);
    }
        
    deleteAddress(id: string) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        if (confirm('Tem certeza que deseja excluir este endereço?')) {
            this.usuarioService.removerEndereco(id, userId).subscribe({
                next: () => {
                    this.toastr.info('Endereço removido.');
                    this.carregarEnderecos(userId);
                },
                error: () => this.toastr.error('Erro ao remover endereço.')
            });
        }
    }
    
    setAsPrimary(id: string) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        this.usuarioService.definirComoPrincipal(id, userId).subscribe({
            next: () => {
                this.toastr.success('Endereço principal atualizado.');
                this.carregarEnderecos(userId);
            },
            error: () => this.toastr.error('Erro ao atualizar.')
        });
    }
}
