import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { FinalizePurchasePageComponent } from './pages/finalize-purchase-page/finalize-purchase-page.component';
import { PrivacyPolicyPageComponent } from './pages/privacy-policy-page/privacy-policy-page.component';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { OrderConfirmedPageComponent } from './pages/order-confirmed-page/order-confirmed-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { MyFavoriteProductsPageComponent } from './pages/my-favorite-products-page/my-favorite-products-page.component';
import { AboutUsPageComponent } from './pages/about-us-page/about-us-page.component';
import { RecoverPasswordPageComponent } from './pages/recover-password-page/recover-password-page.component';
import { DashboardAdminPageComponent } from './pages/dashboard-admin-page/dashboard-admin-page.component';
import { LayoutWithHeaderComponent } from './pages/layouts/layout-with-header/layout-with-header.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },
    
    // --- Páginas com Layout Padrão ---
    {
        path: '',
        component: LayoutWithHeaderComponent,
        children: [
            { path: 'inicio', component: HomePageComponent },
            { path: 'produto', component: ProductPageComponent },
            { path: 'carrinho', component: CartPageComponent },
            { path: 'finalizar-compra', component: FinalizePurchasePageComponent },
            { path: 'pedido', component: OrderPageComponent },
            { path: 'pedido-confirmado', component: OrderConfirmedPageComponent },
            { path: 'perfil', component: ProfilePageComponent },
            { path: 'faq', component: FaqPageComponent },
            { path: 'produtos-favoritos', component: MyFavoriteProductsPageComponent },
            { path: 'sobre-nos', component: AboutUsPageComponent },
            { path: 'politica-de-privacidade', component: PrivacyPolicyPageComponent },
        ]
    },
    
    // --- Páginas de Autenticação ---
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'registrar',
        component: RegisterPageComponent
    },
    {
        path: 'recuperar-senha',
        component: RecoverPasswordPageComponent
    },
    
    // --- Área Administrativa ---
    {
        path: 'dashboard-admin',
        component: DashboardAdminPageComponent
    },
    
    // Rota coringa
    {
        path: '**',
        component: NotFoundPageComponent
    }
];
