import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  inputCode: string;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
  }

  joinLobby() {
    this.api.get('lobby?id=' + this.inputCode).subscribe(data => {
      console.log(data);
      if(data.resp==true) {
        this.api.lobbyID = data.code;
        this.router.navigateByUrl('/who', { skipLocationChange: true });
      }
    });
  }
}
