import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresntationComponent } from './presntation.component';

describe('PresntationComponent', () => {
  let component: PresntationComponent;
  let fixture: ComponentFixture<PresntationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresntationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresntationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
