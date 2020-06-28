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

}
