import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataService {

  timeout: number;

  constructor(
    private http: Http
  ) {
    // 15 seconds
    this.timeout = 1500000;
  }

  // User APIs

  getSkewData() {
    return this.http.get('api/getSkewData')
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  getOptionsData(symbol: string, expirationDate: string) {
    return this.http.get(`api/getOptionsData/${symbol}/${expirationDate}`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  getSingleOptionData(symbol: string, strike: number, putCall: string, dte: number) {
    return this.http.get(`api/getSingleOptionData/${symbol}/${strike}/${putCall}/${dte}`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }
  
}
