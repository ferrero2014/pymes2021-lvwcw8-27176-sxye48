// Ref Angular LazyLoad #1  https://angular.io/guide/lazy-loading-ngmodules

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ClientesComponent } from "./clientes.component";

const routes: Routes = [{ path: "", component: ClientesComponent }];

@NgModule({
  declarations: [ClientesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NgbModule
  ]
})
export class ClientesModule {}
