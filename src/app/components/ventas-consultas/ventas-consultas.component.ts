import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { VentasDetalle } from "../../models/VentasDetalle";
import { FormBuilder, FormGroup } from "@angular/forms";

import { Observable, of } from "rxjs";
import {
catchError,
  debounceTime,
  distinctUntilChanged,
map,
  switchMap
} from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ClientesInfoComponent } from '../clientes-info/clientes-info.component';
import { ModalDialogService } from "../../services/modal-dialog.service";
import { UtilesService } from "../../services/utiles.service";
import { environment } from "../../../environments/environment";


@Component({
  selector: 'app-ventas-consultas',
  templateUrl: './ventas-consultas.component.html',
  styleUrls: ['./ventas-consultas.component.css']
})
export class VentasConsultasComponent implements OnInit {


  constructor(
    public formBuilder: FormBuilder,
    private http: HttpClient,
    private ngbModal: NgbModal,
    private md: ModalDialogService,
    public utiles: UtilesService
  ) { }

  Titulo = "Ventas Consultas";
  FormBusqueda: FormGroup;
  Items = null;  //para evitar mostrar el msj no se encontraron registros la primera vez
  RegistrosTotal: number;
  Pagina = 1; // inicia pagina 1
  ItemsContador = 0;
  ItemSeleccionado = null;
  ItemsDetalles = [];
  Cliente = null;
  
  minDate_fh = null;  //fechaminima fh


  ngOnInit() {
    var FechaHasta = new Date().toISOString();
    var FechaDesde = this.utiles.Fecha_SumarIntervalo(FechaHasta, -30, 0,0);
    this.minDate_fh = this.utiles.Fecha_ISO_Struct(FechaDesde);  // establecer fecha minima del FechaHasta

    this.FormBusqueda = this.formBuilder.group({
      IdCliente: [null],
      FechaDesde: [FechaDesde],
      FechaHasta: [FechaHasta]
    });
    this.FormBusqueda.controls['FechaDesde'].valueChanges.subscribe(value => {
      try {
        if (this.utiles.Fecha_Comparar(value, this.FormBusqueda.value.FechaHasta) == 1) {
          this.FormBusqueda.patchValue({ FechaHasta: value });
        }
        this.minDate_fh = this.utiles.Fecha_ISO_Struct(value);

      } catch (error) {
      }
    })

    //


  }

  //Ref Angular Focus
  @ViewChild("refCliente") inputCliente: ElementRef;
  ngAfterViewInit() {
    this.inputCliente.nativeElement.focus();
  }

  //------------
  //typeahead Cliente
  typeAheadSearch_cli = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchText =>
        searchText.length < 3 ? of([])   // menos de tres caracteres no busca
          :
        this.http.get(environment.ConexionWebApiProxy +  "clientes/typeahead", 
        { params: { Nombre: searchText }, headers: { 'NoBloquearPantalla': '1' } })
        .pipe(catchError(() => { return of([]); }))
      ),
       map((x: any) => x.Items ? x.Items : x)  // por ahora porque estoy reciclando la consulta que devueve Items+registrototal
      
    );

  typeAheadformatter_cli(x) {
    return x.Nombre; // viene del servicio
  }
  typeAheadselectItem_cli(event, input) {
    // al seleccionar se guarda el cliente
    this.Cliente = event.item;
    this.FormBusqueda.value.IdCliente = event.item?.IdCliente;
  }
  typeAheadBlur_cli(input) {
    //si modifico el texto con el buscado, no se acepta y se borra.
    if (input.value != this.Cliente?.Nombre) {
      input.value = "";
      this.Cliente = null;
      this.FormBusqueda.value.IdCliente = null;
    }
  }

  Buscar() {
    // envio el formulario de busqueda completo
    let params = { ...this.FormBusqueda.value};
    params.IdCliente = this.Cliente?.IdCliente;  
    params.Pagina = this.Pagina;

    this.http.get<any>(environment.ConexionWebApiProxy +  "ventas", { params})
      .subscribe(x => {
        this.Items = x.Items;
        this.RegistrosTotal = x.RegistrosTotal;
        this.ItemsDetalles = [];
      });
  }

  VerDetalle(Item) {
    this.ItemSeleccionado = Item;
    this.http.get(environment.ConexionWebApiProxy +  "ventasdetalles/" + Item.IdVenta)
      .subscribe(x => {
        this.ItemsDetalles = x as any;
        this.ItemsContador = 0;     
        this.ItemsDetalles.forEach( item => this.ItemsContador  +=  +item.Cantidad) ;
        setTimeout(() => {
          document.getElementById("divVentasDetalles").scrollIntoView();
        }, 100);
      });
  }

  VerInfoCliente() {
    if (this.Cliente) {
      const modalRef = this.ngbModal.open(ClientesInfoComponent,
        { centered: true, backdrop: 'static', size: 'lg', windowClass: 'modal-xl' });
      modalRef.componentInstance.Cliente = this.Cliente;
    }
    else {
      this.md.Alert("No hay cliente seleccionado!!!");
    }
  }

  ImprimirListado() {
    this.md.Alert("Sin desarrollar...");
  }

}
