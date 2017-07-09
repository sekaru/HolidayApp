import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-join',
  providers: [CookieService],
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  error: string = "";

  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
  }

  joinLobby(inputCode: string) {
    this.api.get('lobby?id=' + inputCode.toUpperCase()).subscribe(data => {
      if(data.resp==true) {
        this.error = "";
        this.api.lobbyID = data.code;
        this.router.navigateByUrl('/who', { skipLocationChange: true });

        // add a cookie
        this.cookieService.set('lobby', this.api.lobbyID, 365);
      } else {
        this.error = data.msg;
      }
    });
  }
}
