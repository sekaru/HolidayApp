import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
  addingPlace: boolean;
  error: string = "";
  showLink: number = -1;
  sortMode: number = 0;

  @ViewChild('search') searchBar:ElementRef;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.api.get('get-colour?lobby=' + this.api.lobbyID + '&name=' + this.api.name).subscribe(data => {
      this.colour = data.resp;
    });

    // update places every so often
    let timer = TimerObservable.create(1, 2500);
    timer.subscribe(t => {
        this.updatePlaces();
    });
  }

  updatePlaces() {
    this.api.get('get-places?lobby=' + this.api.lobbyID + '&sort=' + this.sortMode).subscribe(data => {
      for(let i=0; i<data.length; i++) {
        // check if it's a dupe
        let dupe = this.isDuplicate(data[i]);
        if(dupe==-1) {
          this.places.unshift(data[i]);
        } else {
          this.places[dupe].image = data[i].image;
          this.places[dupe].votes = data[i].votes;
          this.places[dupe].upvoters = data[i].upvoters;
          this.places[dupe].downvoters = data[i].downvoters;
        }
      }
    });
  }

  isDuplicate(data: any) {
    for(let i=0; i<this.places.length; i++) {
      if(this.places[i].link==data.link) return i;
    }
    return -1;
  }

  show(i: number) {
    let search = this.searchBar.nativeElement.value.toLowerCase();

    let link = this.places[i].link.toLowerCase();
    let price = this.places[i].price.toLowerCase();
    let desc = this.places[i].desc ? this.places[i].desc.toLowerCase() : '';
    let author = this.places[i].author.toLowerCase();

    if(search.length>0) {
      if(link.includes(search) || price.includes(search) || (desc.includes(search) && desc.length>0) || author.includes(search)) {
        return true;
      }
    } else {
      return true;
    }
    return false;
  }

  noResults() {
    let count: number = 0;

    for(let i=0; i<this.places.length; i++) {
      if(this.show(i)) count++;
    }

    return count==0;
  }

  sort(mode: number) {
    this.sortMode = mode;
    this.places = [];
    this.updatePlaces();
  }

  checkCard(e:any, i:number) {
    this.showLink = e.type == 'mouseover' ? i : -1;
  }

  showNewLabel(place: any):boolean {
    if(place.upvoters.indexOf(this.api.name)!=-1 || place.downvoters.indexOf(this.api.name)!=-1) return false;
    return true;
  }

  vote(index: number, type: number) {
    this.api.post('vote', {lobby: this.api.lobbyID, link: this.places[index].link, name: this.api.name, type: type}).subscribe(data => {
      this.updatePlaces();
    });
  }

  getVoteClass(place: any) {
    if(place.upvoters.indexOf(this.api.name)!=-1) return "btn-success";
    if(place.downvoters.indexOf(this.api.name)!=-1) return "btn-danger";
    return "btn-default";
  }

  getVoteString(place: any) {
    let upvoters = place.upvoters.length==0 ? "" : "Upvoted by: " + place.upvoters.join(', ');
    let downvoters = place.downvoters.length==0 ? "" : " Downvoted by: " + place.downvoters.join(', ');
    if(upvoters.length>0 && downvoters.length>0) upvoters += ".\n";

    return upvoters + downvoters;
  }

  addPlace(link: string, price: string, desc: string) {
    if(!link.startsWith('http://') && !link.startsWith('https://')) link = 'http://' + link;

    let place = {lobby: this.api.lobbyID, author: this.api.name, link: link, price: price, desc: desc};

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

  delete(index: number) {
    this.api.delete('delete?lobby=' + this.api.lobbyID + '&link=' + this.places[index].link).subscribe(data => {
      if(data.resp==true) {
        this.places.splice(index, 1);
      }
    });
  }

  logout() {
    this.api.name = "";
    this.router.navigateByUrl('/who', { skipLocationChange: true })
  }
}
