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
      this.router.navigateByUrl('/who', { skipLocationChange: true });
    }
  }
}
