import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent implements OnInit {
  error: string = "";

  @ViewChild('registerModal') public childModal:ModalDirective;

  constructor(public api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
  }

  public showModal():void {
    this.error = "";
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }

  registerUser(name: string, pass: string, pass2: string) {
    if(pass!==pass2) {
      this.error = "Those passwords don't match";
      return;
    }

    this.api.registerUser({lobby: this.api.lobbyID, name: name, pass: pass}).subscribe(data => {
      if(data.resp===true) {
        this.hideModal();
        this.api.name = name;

        // add a cookie
        this.cookieService.set('user', this.api.name, 365);

        this.router.navigateByUrl('/lobby', { skipLocationChange: true });
      } else {
        this.error = data.msg;
      }
    });
  }
}