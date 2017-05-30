import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { JoinComponent } from './join/join.component';
import { CreateComponent } from './create/create.component';
import { WhoComponent } from './who/who.component';
import { LobbyComponent } from './lobby/lobby.component';
import { RandomComponent } from './random/random.component';

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'join',
    component: JoinComponent
  },
  {
    path: 'create',
    component: CreateComponent
  },
  {
    path: 'who',
    component: WhoComponent
  },
  {
    path: 'lobby',
    component: LobbyComponent
  },
  {
    path: 'random',
    component: RandomComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
