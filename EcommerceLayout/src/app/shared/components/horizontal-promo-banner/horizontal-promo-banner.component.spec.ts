import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalPromoBannerComponent } from './horizontal-promo-banner.component';

describe('HorizontalPromoBannerComponent', () => {
  let component: HorizontalPromoBannerComponent;
  let fixture: ComponentFixture<HorizontalPromoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalPromoBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalPromoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
