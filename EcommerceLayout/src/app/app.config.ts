import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { GlobalErrorHandler } from './core/error/global-error-handler';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([authInterceptor]) 
        ),
        provideAnimations(),
        provideToastr({
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
            progressBar: true,
        }),
        provideEnvironmentNgxMask() ,
        { provide: ErrorHandler, useClass: GlobalErrorHandler }
    ]
};
