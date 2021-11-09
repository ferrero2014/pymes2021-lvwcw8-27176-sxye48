import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Articulo } from "../../models/articulo";
import { VentasDetalle } from "../../models/VentasDetalle";
import { ArticulosService } from "../../services/articulos.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, of } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap
} from "rxjs/operators";

import { HttpClient } from '@angular/common/http';
import { ModalDialogService } from "../../services/modal-dialog.service";
import { environment } from "../../../environments/environment";
import { ClientesInfoComponent } from "../clientes-info/clientes-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UtilesService } from "../../services/utiles.service";




@Component({
  selector: "app-ventas",
  templateUrl: "./ventas.component.html",
  styleUrls: ["./ventas.component.css"]
})
export class VentasComponent implements OnInit {
  constructor(
    public formBuilder: FormBuilder,
    private http: HttpClient,
    private ngbModal: NgbModal,
    private md : ModalDialogService,
    private utiles: UtilesService

  ) {}

  Titulo = "Ventas";
  FormBusqueda: FormGroup;
  Items: VentasDetalle[] = [];
  TotalPrecio= 0;
  TotalCantidad= 0;



  ngOnInit() {
    this.FormBusqueda = this.formBuilder.group({
      Cliente: [null],
      Fecha: [this.utiles.FechaHoraActual_ISO()]
    });
  }
  
    //  "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"

  //Ref Angular Focus
  @ViewChild("refCliente") inputCliente: ElementRef;
  ngAfterViewInit() {
    this.inputCliente.nativeElement.focus();
  }

  // https://weblog.west-wind.com/posts/2019/Apr/08/Using-the-ngBootStrap-TypeAhead-Control-with-Dynamic-Data#binding-values-to-the-typeahead
  //------------
  //  typeahead Articulo
  typeAheadformatter(x) {
    return x.Nombre; // viene del servicio
  }
  typeAheadselectItem(event, input) {
    this.Agregar(event.item); // al seleccionar agrego el articulo
    setTimeout(() => (input.value = ""), 100);  // y luego lo borro para elegir otro
  }
  typeAheadSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        term.length < 3  ? of([])
          : 
            this.http.get(environment.ConexionWebApiProxy +  "articulos",
              { params: { Pagina:'1', "Nombre": term  }, headers :{'NoBloquearPantalla': '1'}})
              .pipe(catchError(() => { return of([]); }))
      ),
      map((x: any) => (x.Items ? x.Items : x)) // por ahora porque estoy reciclando la consulta que devueve Items+registrototal
    );
  typeAheadBlur(input) {
    // nada por ahora
  }
  
  //------------
  //typeahead Cliente
  typeAheadformatter_cli(x) {
    return x.Nombre; // viene del servicio
  }
  typeAheadselectItem_cli(event, input) {
    // al seleccionar se guarda el cliente
    this.FormBusqueda.value.Cliente = event.item;
  }
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
  typeAheadBlur_cli(input) {
    //si modifico el texto con el buscado, no se acepta y se borra.
    if (input.value != this.FormBusqueda.value.Cliente?.Nombre) {
      input.value = "";
      //this.FormBusqueda.value.Cliente = null;  // no funciona bien, diferencia??
      this.FormBusqueda.patchValue({ Cliente: null });
    }
  }

  Agregar(item) {
    if (item) {
      let item1 = new VentasDetalle();
      item1.IdArticulo = item.IdArticulo;
      item1.Nombre = item.Nombre;
      item1.Cantidad = 1;
      item1.Precio = item.Precio
      this.Items.unshift(item1);  // agregar al principio
      this.CalcularTotales();
    }
  }

  Eliminar(index) {
    this.Items.splice(index, 1);
    this.CalcularTotales();
  }

  CambiarCantidad(index, cuanto) {
    if (this.Items[index].Cantidad == 1 && cuanto == -1) return;  // al menos una unidad!
    this.Items[index].Cantidad += cuanto;
    this.CalcularTotales();
  }

  CalcularTotales() {
    this.TotalPrecio = 0;
    this.TotalCantidad = 0;
    this.Items.forEach(x => { 
      this.TotalPrecio += x.Cantidad * x.Precio;
      this.TotalCantidad += x.Cantidad;
    });

    // for (let x = 0; x < this.Items.length; x++) {
    //   this.TotalPrecio += this.Items[x].Cantidad * this.Items[x].Precio;
    //   this.TotalCantidad += this.Items[x].Cantidad;
    // }
  }

  Grabar() {
    if(! this.FormBusqueda.value.Fecha)
      {
        this.md.Alert("Debe selecionar una Fecha!")
        return;
      }
    if(this.FormBusqueda.value.Cliente?.IdCliente== null)
      {
        this.md.Alert("Debe selecionar un Cliente!")
        return;
      }
      if(this.Items.length== 0)
      {
        this.md.Alert("Debe selecionar al menos un articulo!")
        return;
      }

      this.http.post(environment.ConexionWebApiProxy +  "ventas",{ Venta: {IdVenta:0, IdCliente: this.FormBusqueda.value.Cliente.IdCliente, Fecha: this.FormBusqueda.value.Fecha, Total:this.TotalPrecio}, VentasDetalle : this.Items})
      .subscribe(x=> {
        this.md.Alert("Venta grabada con exito!");
        this.ReiniciarVenta();
    });
  }
  ReiniciarVenta() {
    this.FormBusqueda.patchValue({ Cliente: null });
    this.Items = [];
    this.CalcularTotales();
    }

     VerInfoCliente() {
      if (this.FormBusqueda.value.Cliente) {
        const modalRef = this.ngbModal.open(ClientesInfoComponent,
          { centered: true, backdrop: 'static', size: 'lg', windowClass: 'modal-xl' });
        modalRef.componentInstance.Cliente = this.FormBusqueda.value.Cliente;
      }
      else {
        this.md.Alert("No hay cliente seleccionado!!!");
      }
  }
}
