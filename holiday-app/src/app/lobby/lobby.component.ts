import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Router } from '@angular/router';
import { CookieService } from 'ng2-cookies';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-lobby',
  providers: [CookieService],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  error: string = "";
  sub: any;

  colour: string;
  places: any[] = [];
  addingPlace: boolean;
  showLink: number = -1;

  sortMode: number = 0;
  sorting: boolean;
  search: string = "";

  currency: string[] = ['£', '$', '€', 'Scale'];
  currencyLabel: string[] = ['GBP', 'USD', 'EUR', ''];
  currencyMode: number = 0;
  scale: number[] = [0];

  desc: string = "";
  price: string = "";

  randLink: number;
  links: string[] = ['airbnb.co.uk/rooms/123456', 
                    'localrestaurant.com', 
                    'cocktailbar.co.uk',
                    'pubdowntheroad.com',
                    'coolhotels.com'];
  randPricePlaceholder: string;
  randPlaceholder: number;
  placeholders: string[] = ['We should choose this place because it\'s really close to the beach!', 
                            'Look at all the fancy cocktails! They\'re ridiculously cheap during their happy hour!',
                            'Cheap food, two for one on drinks and a great view - we need to go here!',
                            'Miles away from the touristy area, great for actually experiencing the city!',
                            'In the heart of the old town where we\'ll be spending most of our time!'];

  constructor(private api: ApiService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    this.api.get('get-colour?lobby=' + this.api.lobbyID + '&name=' + this.api.name).subscribe(data => {
      this.colour = data.resp;
    });

    // sort mode cookie
    if(this.cookieService.check('sortmode')) this.sortMode = parseInt(this.cookieService.get('sortmode'));

    // update places every so often
    let timer = TimerObservable.create(1, 2500);
    this.sub = timer.subscribe(t => {
        this.updatePlaces();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
          this.places[dupe].price = data[i].price;
          this.places[dupe].desc = data[i].desc;
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

  pricePress(event: any) {
    let max: number = 9;

    if(this.price.length>=max) {
      this.price = this.price.substr(0, max);
    }
  }

  show(i: number) {
    let search = this.search.toLowerCase();

    let link = this.places[i].link.toLowerCase();
    let price = this.places[i].price.toLowerCase();
    let desc = this.places[i].desc ? this.places[i].desc.toLowerCase() : '';
    let author = this.places[i].author.toLowerCase();
    let archived = this.places[i].archived;

    if((this.sortMode===5 && !archived) || (this.sortMode!==5 && archived)) return false;

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

    this.cookieService.set('sortmode', this.sortMode.toString(), 365);
  }

  checkCard(e:any, i:number) {
    this.showLink = e.type == 'mouseover' ? i : -1;
  }

  isMobile() {
    return window.innerWidth<=768;
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

  addPlace(link: string) {
    if(!link.startsWith('http://') && !link.startsWith('https://')) link = 'http://' + link;

    let place = {lobby: this.api.lobbyID, author: this.api.name, link: link, price: this.currency[this.currencyMode] + this.price, desc: this.desc};

    this.api.post('add-place', place).subscribe(data => {
      if(data.resp==true) {
        this.updatePlaces();
        this.addingPlace = false;
        this.error = this.desc = "";
        this.price = null;

        window.scrollTo(0,0);
      } else {
        this.error = data.msg;
      }
    });
  }

  delete(index: number) {
    this.api.post('delete', {lobby: this.api.lobbyID, link: this.places[index].link}).subscribe(data => {;
      if(data.resp===true) {
        this.places.splice(index, 1);
        if(this.places.length===this.getNumArchived()) this.sort(5);
      }
    });
  }

  randomiser() {
    // this.router.navigateByUrl('/random', { skipLocationChange: true });
    let index = Math.floor(Math.random()*this.places.length);
    window.open(this.places[index].link, "_blank");
  }

  logout() {
    this.cookieService.delete('user');
    this.cookieService.delete('sortmode');
    this.api.name = "";
    this.router.navigateByUrl('/who', { skipLocationChange: true })
  }

  addToScale() {
    if(this.scale.length<5) this.scale.push(0);
    this.updateScalePrice();
  }

  removeFromScale() {
    if(this.scale.length>1) this.scale.pop();
    this.updateScalePrice();
  }

  updateScalePrice() {
    this.price = "";
    for(let i=0; i<this.scale.length; i++) this.price+="£";
  }

  updateCurrencyMode(mode: number) {
    let prevMode = this.currencyMode;

    this.currencyMode = mode;
    if(this.currency[mode]==="Scale") this.updateScalePrice();
    if(this.currency[prevMode]==="Scale") this.price = "";
  }

  trimmedPrice(price: any) {
    let trimmedPrice = price;
    if(trimmedPrice.startsWith("Scale")) trimmedPrice = trimmedPrice.replace("Scale", "");
    return trimmedPrice;
  }

  openAddPlaceForm() {
    this.addingPlace = true;
    this.randLink = Math.floor(Math.random()*this.links.length);    
    this.randPricePlaceholder = (Math.floor(Math.random()*140)+10).toFixed(2);
    this.randPlaceholder = Math.floor(Math.random()*this.placeholders.length);
    this.updateCurrencyMode(this.currencyMode);
  }

  restore(place: any) {
    this.api.post('restore', {lobby: this.api.lobbyID, link: place.link}).subscribe(data => {;
      if(data.resp==true) {
        place.archived = false;
        if(this.getNumArchived()===0) this.sort(0);
      }
    });
  }

  canGoToRandomiser() {
    return this.places.length>0 && this.getNumArchived()!==this.places.length;
  }

  getNumArchived() {
    let total = 0;
    for(let place of this.places) if(place.archived) total++;
    return total;
  }
}
