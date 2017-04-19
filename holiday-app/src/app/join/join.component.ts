import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  error: string = "";

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
  }

  joinLobby(inputCode: string) {
    this.api.get('lobby?id=' + inputCode.toUpperCase()).subscribe(data => {
      if(data.resp==true) {
        this.error = "";
        this.api.lobbyID = data.code;
        this.router.navigateByUrl('/who', { skipLocationChange: true });
      } else {
        this.error = data.msg;
      }
    });
  }
}
