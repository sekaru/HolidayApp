import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-who',
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent implements OnInit {
  users: any[];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.get('get-users?id=' + this.api.lobbyID).subscribe(data => {
      this.users = data;
    });
  }

  getColour(index: number) {
    return this.users[index].colour;
  }
}
