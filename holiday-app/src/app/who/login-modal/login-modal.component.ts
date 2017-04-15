import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {
  name: string;
  greetings: string[] = ['Hey', 'Hello', 'Hi', 'Hallo', 'Guten Tag', 'Bonjour', 'Hola', 'Ciao', 'Olà', 'Konnichiwa'];
  randGreeting: number;
  loginPass: string;
  error: string = "";

  @ViewChild('loginModal') public childModal:ModalDirective;
 
  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
  }

  public showModal(name: string):void {
    this.name = name;
    this.randGreeting = Math.floor(Math.random()*this.greetings.length);
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }

  tryLogin() {
    this.api.tryLogin({name: this.name, pass: this.loginPass}).subscribe(data => {
      if(data.resp==true) {
        this.hideModal();
        this.router.navigateByUrl('/lobby', { skipLocationChange: true });
      } else {
        this.error = data.msg;
      }
    });
  }
}
