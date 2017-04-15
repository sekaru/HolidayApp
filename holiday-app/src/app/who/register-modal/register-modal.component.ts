import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent implements OnInit {
  registerName: string;
  registerPass: string;

  @ViewChild('registerModal') public childModal:ModalDirective;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
  }

  public showModal():void {
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }

  registerUser() {
    this.api.registerUser({lobby: this.api.lobbyID, name: this.registerName, pass: this.registerPass}).subscribe(data => {
      this.hideModal();
    });
  }
}