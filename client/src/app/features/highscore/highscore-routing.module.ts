import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HighscoreComponent } from './components/highscore.component';

const routes: Routes = [
  { path: 'highscore', component: HighscoreComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HighscoreRoutingModule { }
