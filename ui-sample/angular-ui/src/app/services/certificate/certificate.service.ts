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
  http: HttpClient;
  baseUrl: string;

  constructor(http: HttpClient) {
    this.http = http;
    this.baseUrl = urlConfig.URLS.BASE_URL;
  }

  public getCertificateList(): Observable<any> {
    const headers = { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    return this.http.get(`${this.baseUrl}${urlConfig.URLS.SHOW_CERT}`, { headers }).pipe(
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
    return this.http.post(`http://localhost:9000/user/email`, requestBody, { 'headers': headers })
  }
}
