import { Component } from '@angular/core';
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-layout-with-header',
  imports: [HeaderComponent, RouterModule],
  templateUrl: './layout-with-header.component.html',
  styleUrl: './layout-with-header.component.css'
})
export class LayoutWithHeaderComponent {

}
