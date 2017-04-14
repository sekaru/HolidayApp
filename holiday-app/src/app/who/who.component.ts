import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-who',
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent implements OnInit {
  users: string[] = ['Tudor', 'Natalie', 'Rory'];

  constructor() { }

  ngOnInit() {
  }
}
