import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HeaderV2Component } from '../../../shared/components/header-v2/header-v2.component';

@Component({
  selector: 'app-layout-with-header',
  imports: [HeaderV2Component, RouterModule],
  templateUrl: './layout-with-header.component.html',
  styleUrl: './layout-with-header.component.css'
})
export class LayoutWithHeaderComponent {

}
