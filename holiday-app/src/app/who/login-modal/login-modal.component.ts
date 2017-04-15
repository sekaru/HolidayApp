import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {
  name: string;
  greetings: string[] = ['Hey', 'Hello', 'Hi', 'Hallo', 'Guten Tag', 'Bonjour', 'Hola', 'Ciao', 'Olà', 'Konnichiwa'];
  randGreeting: number;

  @ViewChild('loginModal') public childModal:ModalDirective;
 
  constructor() { }

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
}
