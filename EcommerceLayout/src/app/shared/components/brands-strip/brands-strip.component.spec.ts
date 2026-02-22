import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsStripComponent } from './brands-strip.component';

describe('BrandsStripComponent', () => {
  let component: BrandsStripComponent;
  let fixture: ComponentFixture<BrandsStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandsStripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandsStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
