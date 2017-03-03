import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  code: string;

  constructor() {
    this.genCode();
  }

  ngOnInit() {
  }

  genCode() {
    let possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let len: number = 5;
    this.code = "";

    for(let i=0; i<len; i++) {
      this.code += possible.charAt(Math.floor(Math.random() * possible.length));
    }  
  }
}
