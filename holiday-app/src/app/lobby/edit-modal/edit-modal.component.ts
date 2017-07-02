import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from '../../api.service';

@Component({
  selector: 'edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent implements OnInit {
  place: any;
  error: string = "";

  link: string;
  image: string;
  price: string;
  currency: string;
  desc: string;

  @ViewChild('editModal') public childModal:ModalDirective;

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

  public showModal(place: any):void {
    this.place = place;
    
    this.link = place.link;
    this.image = place.image;
    this.price = place.price.substring(1);
    this.currency = place.price.substring(0, 1);
    this.desc = place.desc;

    this.childModal.show();
  }
 
  public hideModal():void {
    this.childModal.hide();
  }

  pricePress(event: any) {
    let max: number = 9;

    if(this.price.length>=max) {
      this.price = this.price.substr(0, max);
    }
  }

  public update() {
    if(!this.link.startsWith('http://') && !this.link.startsWith('https://')) this.link = 'http://' + this.link;

    let place = {lobby: this.api.lobbyID, author: this.api.name, link: this.link, price: this.currency + this.price, desc: this.desc, image: this.image} ;

    this.api.post('add-place', place).subscribe(data => {
      if(data.resp==true) {
        this.error = "";
        this.hideModal();
      } else {
        this.error = data.msg;
      }
    });
  }
}

