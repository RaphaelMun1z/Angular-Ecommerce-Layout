import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoBannersGridComponent } from './promo-banners-grid.component';

describe('PromoBannersGridComponent', () => {
  let component: PromoBannersGridComponent;
  let fixture: ComponentFixture<PromoBannersGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoBannersGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoBannersGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
