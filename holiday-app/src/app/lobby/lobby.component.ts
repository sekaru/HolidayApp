import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  colour: string;
  places: any[] = [];
  addingPlace: boolean;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.get('get-colour?lobby=' + this.api.lobbyID + '&name=' + this.api.name).subscribe(data => {
      this.colour = data.resp;
    });

    this.api.get('get-places?lobby=' + this.api.lobbyID).subscribe(data => {
      //console.log(data);
      for(let i=0; i<data.length; i++) this.places.push(data[i]);
    });
  }

  upvote(index: number) {
    this.places[index].votes++;
  }

  downvote(index: number) {
    this.places[index].votes--;
    if(this.places[index].votes==0) this.places.splice(index, 1);
  }

  addPlace(link: string, price: string) {
    if(!link.startsWith('https://')) link = 'https://' + link;

    let place = {lobby: this.api.lobbyID, author: this.api.name, link: link, price: price, votes: 0};

    this.api.post('add-place', place).subscribe(data => {
      this.places.push(place);
      this.addingPlace = false;
    });
  }
}
