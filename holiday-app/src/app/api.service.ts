import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  title: string;
  address: string;
  lobbyID: string;
  name: string;

  constructor(private http: Http) {
    this.title = "Just Pick It!";
    this.address = "http://35.156.58.36:3000";
    // this.address = "http://localhost:3000";
  }

  get(params: string) {
    return this.http.get(this.address + '/' + params, {withCredentials: true})
                    .map(res => res.json());
  }

  post(params: string, data: any) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.address + "/" + params, data, {headers: headers, withCredentials: true})
                    .map(res => res.json());
  }

  delete(params: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    return this.http.delete(this.address + '/' + params, {headers: headers, withCredentials: true})
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
