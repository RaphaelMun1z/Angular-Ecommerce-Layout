import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixedSectionComponent } from './mixed-section.component';

describe('MixedSectionComponent', () => {
  let component: MixedSectionComponent;
  let fixture: ComponentFixture<MixedSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MixedSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MixedSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
