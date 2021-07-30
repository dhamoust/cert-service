import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import urlConfig from '../urlConfig.json';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  constructor(private http: HttpClient) { }

  public getCertificateList(): Observable<any> {
    return this.http.get(`${urlConfig.URLS.BASE_URL}${urlConfig.URLS.SHOW_CERT}`).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((err) => {
        return err;
      })
    );
  }
}
