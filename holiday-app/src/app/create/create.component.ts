import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  code: string;
  copied: boolean = false;

  constructor(private api: ApiService, private router: Router) {
    this.getCode();
  }

  ngOnInit() {
  }

  getCode() {
    this.api.get('lobby-code').subscribe(data => {
      this.code = data.code;
    });
  }

  getCopyText() {
    if(!this.copied) {
      return "Copy to Clipboard";
    } else {
      return "Copied!";
    }
  }

  joinLobby() {
    this.api.makeLobby(this.code).subscribe(data => {
      if(data.resp==true) {
        this.api.lobbyID = this.code;
        this.router.navigateByUrl('/who', { skipLocationChange: true });
      }
    });
  }
}
