import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  address: string;

  constructor(private http: Http) {
    this.address = "http://localhost:3000";
  }

  makeLobby(lobbyID: string) {
    console.log(lobbyID);

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.address + "/make-lobby", {id: lobbyID}, {headers: headers})
              .map(res => res.json());
  }
}
