import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechTalkComponent } from './tech-talk.component';

describe('TechTalkComponent', () => {
  let component: TechTalkComponent;
  let fixture: ComponentFixture<TechTalkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechTalkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechTalkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
