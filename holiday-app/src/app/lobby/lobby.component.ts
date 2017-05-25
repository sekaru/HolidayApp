import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'app-lobby',
  providers: [CookieService],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  error: string = "";

  colour: string;
  places: any[] = [];
  addingPlace: boolean;
  showLink: number = -1;

  sortMode: number = 0;
  sorting: boolean;
  search: string = "";

  currency: string[] = ['£', '$', '€'];
  currencyLabel: string[] = ['GBP', 'USD', 'EUR'];
  currencyMode = 0;

  desc: string = "";

  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    this.api.get('get-colour?lobby=' + this.api.lobbyID + '&name=' + this.api.name).subscribe(data => {
      this.colour = data.resp;
    });

    // sort mode cookie
    if(this.cookieService.check('sortmode')) this.sortMode = parseInt(this.cookieService.get('sortmode'));

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

      this.sorting = false;
    });
  }

  isDuplicate(data: any) {
    for(let i=0; i<this.places.length; i++) {
      if(this.places[i].link==data.link) return i;
    }
    return -1;
  }

  show(i: number) {
    let search = this.search.toLowerCase();

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
    this.sorting = true;
    this.sortMode = mode;
    this.places = [];
    this.updatePlaces();

    this.cookieService.set('sortmode', this.sortMode.toString());
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
    return "btn-default neutral";
  }

  getVoteString(place: any) {
    let upvoters = place.upvoters.length==0 ? "" : "Upvoted by: " + place.upvoters.join(', ');
    let downvoters = place.downvoters.length==0 ? "" : " Downvoted by: " + place.downvoters.join(', ');
    if(upvoters.length>0 && downvoters.length>0) upvoters += ".\n";

    return upvoters + downvoters;
  }

  addPlace(link: string, price: string) {
    if(!link.startsWith('http://') && !link.startsWith('https://')) link = 'http://' + link;

    let place = {lobby: this.api.lobbyID, author: this.api.name, link: link, price: this.currency[this.currencyMode] + price, desc: this.desc};

    this.api.post('add-place', place).subscribe(data => {
      if(data.resp==true) {
        this.updatePlaces();
        this.addingPlace = false;
        this.error = "";
        this.desc = "";
        window.scrollTo(0,0);
      } else {
        this.error = data.msg;
      }
    });
  }

  delete(index: number) {
    this.api.post('delete', {lobby: this.api.lobbyID, link: this.places[index].link}).subscribe(data => {;
      if(data.resp==true) {
        this.places.splice(index, 1);
      }
    });
  }

  logout() {
    this.cookieService.delete('user');
    this.cookieService.delete('sortmode');
    this.api.name = "";
    this.router.navigateByUrl('/who', { skipLocationChange: true })
  }
}
