import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'login-modal',
  providers: [CookieService],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {
  name: string;
  greetings: string[] = ['Hey', 'Hello', 'Hi', 'Hallo', 'Guten Tag', 'Bonjour', 'Hola', 'Ciao', 'Olà', 'Konnichiwa', 'Buna', 'Salut', 'Aloha', 'Ahoj'];
  randGreeting: number;
  error: string = "";

  @ViewChild('loginModal') public childModal:ModalDirective;
 
  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
  }

  public showModal(name: string):void {
    this.error = "";
    this.name = name;
    this.randGreeting = Math.floor(Math.random()*this.greetings.length);
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }

  tryLogin(password: string) {
    this.api.tryLogin({name: this.name, pass: password}).subscribe(data => {
      if(data.resp==true) {
        this.hideModal();
        this.api.name = this.name;

        // add a cookie
        this.cookieService.set('user', this.api.name);

        this.router.navigateByUrl('/lobby', { skipLocationChange: true });
      } else {
        this.error = data.msg;
      }
    });
  }
}
