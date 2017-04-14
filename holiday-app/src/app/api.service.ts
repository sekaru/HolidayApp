import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  address: string;
  lobbyID: string;

  constructor(private http: Http) {
    this.address = "http://localhost:3000";
  }

  get(params: string) {
    return this.http.get(this.address + '/' + params)
                    .map(res => res.json());
  }

  makeLobby(lobbyID: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.address + "/make-lobby", {id: lobbyID}, {headers: headers})
                    .map(res => res.json());
  }

  registerUser(data: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.address + "/make-user", data, {headers: headers})
                    .map(res => res.json());
  }
}
