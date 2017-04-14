import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  code: string;

  constructor(private api: ApiService) {
    this.getCode();
  }

  ngOnInit() {
  }

  getCode() {
    this.api.get('lobby-code').subscribe(data => {
      this.code = data.code;
    });
  }

  joinLobby() {
    this.api.makeLobby(this.code).subscribe();
  }
}
