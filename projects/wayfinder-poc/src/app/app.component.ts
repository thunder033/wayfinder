import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LegendComponent } from './lib/legend/legend.component';
import { ViewportComponent } from './lib/viewport/viewport.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ViewportComponent, LegendComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  title = 'wayfinder-poc';

  ngOnInit(): void {}
}
