import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-home',
  providers: [CookieService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    if(this.cookieService.check('lobby')) {
      this.api.lobbyID = this.cookieService.get('lobby');
      
      if(this.cookieService.check('user')) {
        this.api.name = this.cookieService.get('user');

        // tell the API we logged in via a cookie
        this.api.post('cookie-login', {lobby: this.api.lobbyID, name: this.api.name}).subscribe(data => {
          if(data.resp==true) {
            this.router.navigateByUrl('/lobby', { skipLocationChange: true });
          } else {
            this.cookieService.delete('user');
          }
        });
      } else {
        this.router.navigateByUrl('/who', { skipLocationChange: true });
      }
    }
  }
}
