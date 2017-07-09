import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-home',
  providers: [CookieService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private api: ApiService, private router: Router, private activatedRoute: ActivatedRoute, private cookieService: CookieService) { }

  ngOnInit() {
    // check if they've entered a code
    this.activatedRoute.queryParams.subscribe(params => {
      let qp = 'lobby';

      if(params[qp]) {
        this.api.get('lobby?id=' + params[qp]).subscribe(data => {
          if(data.resp==true) {
            // go to that lobby
            this.cookieService.set('lobby', params[qp], 365);
            this.api.lobbyID = params[qp];

            if(this.cookieService.check('user')) {
              this.cookieLogin();
            } else {
              this.router.navigate(['who'], { queryParams: {} });
              this.router.navigateByUrl('/who', { skipLocationChange: true });
            }
            return;
          } else {
            this.checkCookies();
          }
        });
      } else {
        this.checkCookies();
      }
    });
  }

  checkCookies() {
    // cookies
    if(this.cookieService.check('lobby')) {
      this.api.lobbyID = this.cookieService.get('lobby');
      
      if(this.cookieService.check('user')) {
        this.cookieLogin();
      } else {
        this.router.navigateByUrl('/who', { skipLocationChange: true });
      }
    }
  }

  cookieLogin() {
    this.api.name = this.cookieService.get('user');

    // tell the API we logged in via a cookie
    this.api.post('cookie-login', {lobby: this.api.lobbyID, name: this.api.name}).subscribe(data => {
      if(data.resp==true) {
        this.router.navigateByUrl('/lobby', { skipLocationChange: true, queryParams: {} });
      } else {
        this.cookieService.delete('user');
      }
    });
  }
}
