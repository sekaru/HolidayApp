import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ng2-cookies';
import { CarouselConfig } from 'ngx-bootstrap/carousel';

@Component({
  selector: 'app-home',
  providers: [CookieService, {provide: CarouselConfig, useValue: {interval: 5000, noPause: true}}],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(public api: ApiService, private router: Router, private activatedRoute: ActivatedRoute, private cookieService: CookieService) {
  }

  ngOnInit() {
    let self = this;
    this.api.init().subscribe(data => {
      self.api.getExternal(data + "/server?id=jpi").subscribe(data => {
        self.api.address = data;

        // check if they've entered a code
        this.activatedRoute.queryParams.subscribe(params => {
          if(params.lobby) {
            this.api.get('lobby?id=' + params.lobby).subscribe(data => {
              if(data.resp===true) {
                // are they using another lobby?
                if(this.cookieService.check('lobby')) {
                  if(this.cookieService.get('lobby')!==params.lobby) {
                    if(this.cookieService.check('user')) this.cookieService.delete('user');
                  }
                }

                // go to that lobby
                this.cookieService.set('lobby', params.lobby, 365);
                this.api.lobbyID = params.lobby;

                if(this.cookieService.check('user')) {
                  this.cookieLogin();
                } else {
                  this.router.navigate(['who'], { queryParams: {} });
                  this.router.navigateByUrl('/who', { skipLocationChange: true });
                }
              } else {
                this.checkCookies();
              }
            });
          } else {
            this.checkCookies();
          }
        });
      });
    }, err => {
      self.api.address = "http://localhost:3000";
      console.log("Defaulting to localhost...");
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
