import { Injectable } from '@angular/core';
import { Http, Headers, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  title: string;
  address: string;
  lobbyID: string;
  name: string;

  constructor(private http: Http) {
    this.title = "Just Pick It!";
  }

  init() {
    return this.getExternal("http://52.58.65.213:3978/server?id=jpi");
  }

  get(params: string) {
    return this.http.get(this.address + '/' + params, {withCredentials: true})
                    .map(res => res.json());
  }

  getExternal(url: string) {
    return this.http.get(url)
                    .map(res => res.text());
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

  trimmedLink(link: string) {
    let trimmedLink = link;
    if(trimmedLink.startsWith("http://")) {
      trimmedLink = trimmedLink.substring(7);
    } else if(trimmedLink.startsWith("https://")) {
      trimmedLink = trimmedLink.substring(8);
    }

    if(trimmedLink.startsWith("www.")) trimmedLink = trimmedLink.substring(4);

    let dot = trimmedLink.indexOf(".");
    if(dot!==-1) trimmedLink = trimmedLink.substring(0, dot);

    return trimmedLink;
  }
}
