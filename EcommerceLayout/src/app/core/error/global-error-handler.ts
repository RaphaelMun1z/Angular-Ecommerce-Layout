import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private zone: NgZone) {}

    handleError(error: any) {
        if (error instanceof HttpErrorResponse) {
            console.error('Backend returned status code:', error.status);
            console.error('Body was:', error.error);
        } else {
            console.error('An error occurred:', error);
            this.zone.run(() => {
                console.warn(
                    'Alerta para o utilizador: Ocorreu um erro inesperado. Por favor tente novamente.',
                );
            });
        }
    }
}
