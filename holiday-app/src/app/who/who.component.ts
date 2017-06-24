import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-who',
  providers: [CookieService],
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent implements OnInit {
  users: any[] = [];
  loginHover: number;

  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    this.api.get('get-users?id=' + this.api.lobbyID).subscribe(data => {
      this.users = data;
    });
  }

  getColour(index: number) {
    return this.users[index].colour;
  }

  getBorder(index: number) {
    let colour = this.shadeColour(this.getColour(index), -5);
    return '0.15em solid ' + colour;
  }

  shadeColour(color: string, percent: number) {
    let R:number = parseInt(color.substring(1,3),16);
    let G:number = parseInt(color.substring(3,5),16);
    let B:number = parseInt(color.substring(5,7),16);

    R = Math.ceil(R * (100 + percent) / 100);
    G = Math.ceil(G * (100 + percent) / 100);
    B = Math.ceil(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
  }

  loginMouseEnter(index: number) {
    this.loginHover = index;
  }

  loginMouseLeave() {
    this.loginHover = -1;
  }

  logout() {
    this.cookieService.delete('lobby');
    this.api.lobbyID = "";
    this.router.navigateByUrl('/', { skipLocationChange: true })
  }
}
