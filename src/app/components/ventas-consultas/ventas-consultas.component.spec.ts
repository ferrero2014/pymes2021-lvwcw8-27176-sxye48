import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VentasConsultasComponent } from './ventas-consultas.component';

describe('VentasConsultasComponent', () => {
  let component: VentasConsultasComponent;
  let fixture: ComponentFixture<VentasConsultasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VentasConsultasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentasConsultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
