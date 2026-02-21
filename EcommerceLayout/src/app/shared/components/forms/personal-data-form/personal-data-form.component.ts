import { HttpResponse } from '@angular/common/http';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { FileUploadService } from '../../../../services/fileUpload.service';
import { ToastService } from '../../../../services/toast.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
    selector: 'app-personal-data-form',
    imports: [CommonModule, FormsModule, NgxMaskDirective],
    providers: [provideNgxMask()],
    templateUrl: './personal-data-form.component.html',
    styleUrl: './personal-data-form.component.css'
})
export class PersonalDataFormComponent implements OnInit {
    private authService = inject(AuthService);
    private fileUploadService = inject(FileUploadService);
    private usuarioService = inject(UsuarioService);
    private toastService = inject(ToastService);
    
    isEditingMode = signal(false);
    isUploading = signal(false);
    isSaving = signal(false);
    
    formData = {
        nome: '',
        telefone: '',
        cpf: ''
    };
    
    private originalData = {
        nome: '',
        telefone: '',
        cpf: ''
    };
    
    user = signal({
        email: '',
        avatar: '',
        isCliente: false
    });
    
    constructor() {
        effect(() => {
            const currentUser = this.authService.currentUser();
            if (currentUser) {
                const isCliente = currentUser.roles ? currentUser.roles.includes('ROLE_CLIENTE') : false;
                
                this.user.set({
                    email: currentUser.email,
                    avatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.email}&background=0f172a&color=fff`,
                    isCliente: isCliente
                });
                
                if (!this.isEditingMode()) {
                    this.updateLocalData(currentUser);
                }
            }
        });
    }
    
    ngOnInit() {
        this.authService.refreshUserData();
    }
    
    private updateLocalData(currentUser: any) {
        const data = {
            nome: currentUser.name || '',
            telefone: currentUser.phone || '',
            cpf: currentUser.cpf || ''
        };
        this.formData = { ...data };
        this.originalData = { ...data };
    }
    
    toggleEditing() {
        this.isEditingMode.set(true);
    }
    
    cancelEditing() {
        this.formData = { ...this.originalData };
        this.isEditingMode.set(false);
    }
    
    savePersonalData(event: Event) {
        event.preventDefault();
        
        if (!this.formData.nome || this.formData.nome.length < 3) {
            this.toastService.warning('Atenção', 'O nome deve ter pelo menos 3 caracteres.');
            return;
        }
        
        this.isSaving.set(true);
        
        const payload = {
            nome: this.formData.nome,
            telefone: this.formData.telefone ? this.formData.telefone.replace(/\D/g, '') : '',
            cpf: this.formData.cpf ? this.formData.cpf.replace(/\D/g, '') : ''
        };
        
        this.usuarioService.atualizarMeusDados(payload).subscribe({
            next: () => {
                this.toastService.success('Sucesso', 'Dados atualizados com sucesso.');
                this.isSaving.set(false);
                this.isEditingMode.set(false);
                this.authService.refreshUserData();
            },
            error: (err) => {
                const msg = err.error?.message || 'Erro ao salvar alterações.';
                this.toastService.error('Erro', msg);
                this.isSaving.set(false);
            }
        });
    }
    
    onAvatarSelected(event: any) {
        const file: File = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        
        this.isUploading.set(true);
        this.fileUploadService.upload(file).subscribe({
            next: (response: any) => {
                const body = response instanceof HttpResponse ? response.body : response;
                if (body && body.fileName) {
                    this.usuarioService.atualizarMeuAvatar(body.fileName).subscribe({
                        next: () => {
                            this.authService.updateUser({ avatar: body.url });
                            this.toastService.success('Foto Atualizada', 'Seu perfil foi atualizado.');
                            this.isUploading.set(false);
                        },
                        error: () => this.isUploading.set(false)
                    });
                }
            },
            error: () => {
                this.toastService.error('Erro', 'Falha no upload da imagem.');
                this.isUploading.set(false);
            }
        });
    }
    
    handleImageError(event: any) {
        event.target.src = `https://ui-avatars.com/api/?name=${this.user().email}&background=0f172a&color=fff`;
    }
}