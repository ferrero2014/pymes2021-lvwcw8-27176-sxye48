import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientesInfoComponent } from './clientes-info.component';

describe('ClientesInfoComponent', () => {
  let component: ClientesInfoComponent;
  let fixture: ComponentFixture<ClientesInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientesInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
