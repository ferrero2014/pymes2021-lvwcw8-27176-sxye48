import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-clientes-info',
  templateUrl: './clientes-info.component.html',
  styleUrls: ['./clientes-info.component.css']
})
export class ClientesInfoComponent implements OnInit {
  @Input()
  Cliente;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
