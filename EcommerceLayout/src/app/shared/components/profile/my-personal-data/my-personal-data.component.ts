import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PersonalDataFormComponent } from "../../forms/personal-data-form/personal-data-form.component";

@Component({
    selector: 'app-my-personal-data',
    imports: [CommonModule, FormsModule, PersonalDataFormComponent],
    templateUrl: './my-personal-data.component.html',
    styleUrl: './my-personal-data.component.css'
})
export class MyPersonalDataComponent {
}