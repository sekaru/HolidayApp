import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

@Component({
  selector: 'app-random',
  templateUrl: './random.component.html',
  styleUrls: ['./random.component.css']
})
export class RandomComponent implements OnInit {
  colour: string;
  places: any[] = [];
  r: number = -1;
  sub: any;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.api.get('get-colour?lobby=' + this.api.lobbyID + '&name=' + this.api.name).subscribe(data => {
      this.colour = data.resp;
    });

    this.api.get('get-places?lobby=' + this.api.lobbyID + '&sort=' + 0).subscribe(data => {
      this.places = data;
      for(let p of this.places) if(p.archived) this.places.splice(this.places.indexOf(p), 1);

      this.start();
    });
  }

  start() {
    let timer = TimerObservable.create(1, 10);
    this.sub = timer.subscribe(t => {
        this.randomise();
    });
  }

  stop() {
    this.sub.unsubscribe();
  }

  randomise() {
    if(this.places.length===1) {
      this.r = 0;
      this.stop();
      return;
    }

    let n = this.rand();

    while(n==this.r) {
      n = this.rand();
    }
    this.r = n;
  }

  rand() {
    return Math.floor(Math.random()*this.places.length)
  }

  lobby() {
    this.router.navigateByUrl('/lobby', { skipLocationChange: true });
  }
}
