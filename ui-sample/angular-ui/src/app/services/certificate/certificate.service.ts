import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import urlConfig from '../urlConfig.json';
import { IEmailCertificate } from '../email-certificate.model';

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




  sendNotificationToUser(emailCertificate: IEmailCertificate): Observable<any> {

    console.log("emailCertificateObject", emailCertificate);
    const headers = { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    const requestBody = emailCertificate;
    console.log("requestBody", requestBody)
    return this.http.post(`${urlConfig.URLS.BASE_URL}${urlConfig.URLS.EMAIL_NOTIFICATION}`, requestBody, { 'headers': headers })


  }






}


