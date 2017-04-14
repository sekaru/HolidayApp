import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-who',
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent implements OnInit {
  users: string[] = ['Tudor', 'Natalie', 'Rory'];

  constructor(private api: ApiService) { }

  ngOnInit() {}
}
