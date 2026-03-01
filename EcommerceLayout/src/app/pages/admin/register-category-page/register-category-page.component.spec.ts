import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCategoryPageComponent } from './register-category-page.component';

describe('RegisterCategoryPageComponent', () => {
  let component: RegisterCategoryPageComponent;
  let fixture: ComponentFixture<RegisterCategoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCategoryPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCategoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
