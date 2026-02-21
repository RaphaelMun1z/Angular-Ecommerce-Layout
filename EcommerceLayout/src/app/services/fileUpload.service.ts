import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/arquivos`;
    
    upload(file: File): Observable<HttpEvent<any>> {
        const formData = new FormData();
        formData.append('file', file);
        
        const req = new HttpRequest('POST', `${this.API}/upload`, formData, {
            reportProgress: true,
            responseType: 'json'
        });
        
        return this.http.request(req);
    }
    
    getPreviewUrl(fileName: string): string {
        return `${this.API}/download/${fileName}`;
    }
}