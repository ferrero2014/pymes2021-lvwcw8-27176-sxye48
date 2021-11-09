import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { ArticuloFamilia } from '../models/articulo-familia';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArticulosFamiliasService {
  resourceUrl: string;
  constructor(private httpClient: HttpClient) {
    this.resourceUrl =
      environment.ConexionWebApiProxy + 'articulosfamilias' + '/';
    //this.resourceUrl = 'https://localhost:44336/api/articulosfamilias' + '/';
  }

  get() {
    return this.httpClient.get(this.resourceUrl);
  }
  // mismo metodo tipado
  //  get():Observable<ArticuloFamilia[]> {
  //   return this.httpClient.get<ArticuloFamilia[]>(this.resourceUrl);
  // }
}
