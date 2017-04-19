import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-who',
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent implements OnInit {
  users: any[] = [];
  loginHover: number;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.api.get('get-users?id=' + this.api.lobbyID).subscribe(data => {
      this.users = data;
    });
  }

  getColour(index: number) {
    return this.users[index].colour;
  }

  loginMouseEnter(index: number) {
    this.loginHover = index;
  }

  loginMouseLeave(index: number) {
    this.loginHover = -1;
  }

  logout() {
    this.api.logout();
    this.router.navigateByUrl('/', { skipLocationChange: true })
  }
}
