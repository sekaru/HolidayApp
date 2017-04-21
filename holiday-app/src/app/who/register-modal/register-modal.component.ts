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
  error: string = "";

  @ViewChild('registerModal') public childModal:ModalDirective;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
  }

  public showModal():void {
    this.error = "";
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }

  registerUser(registerName: string, registerPass: string) {
    this.api.registerUser({lobby: this.api.lobbyID, name: registerName, pass: registerPass}).subscribe(data => {
      if(data.resp==true) {
        this.hideModal();
        this.api.name = registerName;
        this.router.navigateByUrl('/lobby', { skipLocationChange: true });
      } else {
        this.error = data.msg;
      }
    });
  }
}