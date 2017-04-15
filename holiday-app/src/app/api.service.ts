import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  address: string;
  lobbyID: string;
  name: string;

  constructor(private http: Http) {
    this.address = "http://localhost:3000";

    this.lobbyID = 'G1DAH';
    this.name = 'Tudor';
  }

  get(params: string) {
    return this.http.get(this.address + '/' + params)
                    .map(res => res.json());
  }

  post(params: string, data: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.address + "/" + params, data, {headers: headers})
                    .map(res => res.json());
  }

  makeLobby(lobbyID: string) {
    return this.post('make-lobby', {id: lobbyID});
  }

  registerUser(data: any) {
    return this.post('register', data);
  }

  tryLogin(data: any) {
    return this.post('login', data);
  }
}
