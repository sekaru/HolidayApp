import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {
  @ViewChild('loginModal') public childModal:ModalDirective;
 
  constructor() { }

  ngOnInit() {
  }

  public showModal():void {
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }
}
