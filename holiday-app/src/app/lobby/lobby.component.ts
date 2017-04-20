import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  colour: string;
  places: any[] = []; 
  oldPlaces: any[] = [];
  addingPlace: boolean;
  error: string = "";

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.api.get('get-colour?lobby=' + this.api.lobbyID + '&name=' + this.api.name).subscribe(data => {
      this.colour = data.resp;
    });

    // update places every so often
    let timer = TimerObservable.create(1, 20000);
    timer.subscribe(t => {
        this.updatePlaces();
    });
  }

  updatePlaces() {
    this.api.get('get-places?lobby=' + this.api.lobbyID).subscribe(data => {
      let firstLoad:boolean = this.places.length==0;

      if(!firstLoad) this.oldPlaces = this.places;
      this.places = [];
      for(let i=0; i<data.length; i++) this.places.push(data[i]);

      // so the new tag doesn't show up on first loading
      if(firstLoad) this.oldPlaces = this.places;
    });
  }

  newPlace(index: number):boolean {
    for(let i=0; i<this.oldPlaces.length; i++) {
      if(this.oldPlaces[i].link==this.places[index].link) return false;
    }
    return true;
  }

  vote(index: number, type: number) {
    this.api.post('vote', {lobby: this.api.lobbyID, link: this.places[index].link, name: this.api.name, type: type}).subscribe(data => {
      this.updatePlaces();
    });
  }

  getVoteString(place: any) {
    let upvoters = place.upvoters.length==0 ? "" : "Upvoted by: " + place.upvoters.join(', ');
    let downvoters = place.downvoters.length==0 ? "" : " Downvoted by: " + place.downvoters.join(', ');
    if(upvoters.length>0 && downvoters.length>0) upvoters += ".\n";

    return upvoters + downvoters;
  }

  addPlace(link: string, price: string) {
    if(!link.startsWith('http://') && !link.startsWith('https://')) link = 'http://' + link;

    let place = {lobby: this.api.lobbyID, author: this.api.name, link: link, price: price};

    this.api.post('add-place', place).subscribe(data => {
      if(data.resp==true) {
        this.updatePlaces();
        this.addingPlace = false;
        this.error = "";
        window.scrollTo(0,0);
      } else {
        this.error = data.msg;
      }
    });
  }

  logout() {
    this.api.name = "";
    this.router.navigateByUrl('/who', { skipLocationChange: true })
  }
}
