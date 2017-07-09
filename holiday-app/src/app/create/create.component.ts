import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-create',
  providers: [CookieService],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  code: string;
  link: string;
  copied: boolean = false;

  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) {
    this.getCode();
  }

  ngOnInit() {
  }

  getCode() {
    this.api.get('lobby-code').subscribe(data => {
      this.code = data.code;
      this.link = window.location.origin + "?lobby=" + this.code;

      this.api.makeLobby(this.code).subscribe(data => {
        if(data.resp==true) this.api.lobbyID = this.code;
      });
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
    // add a cookie
    if(this.api.lobbyID) this.cookieService.set('lobby', this.api.lobbyID, 365);

    this.router.navigateByUrl('/who', { skipLocationChange: true });
  }
}
