import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'vote-modal',
  templateUrl: './vote-modal.component.html',
  styleUrls: ['./vote-modal.component.css']
})
export class VoteModalComponent implements OnInit {
  place: any;

  @ViewChild('voteModal') public childModal:ModalDirective;

  constructor() { }

  ngOnInit() {
  }

  public showModal(place: any):void {
    this.place = place;
    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }
}
