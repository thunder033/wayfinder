import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { network, region } from 'wf-core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SystemService } from './lib/system.service';
import { ViewportComponent } from './lib/viewport/viewport.component';
import { LegendComponent } from './lib/legend/legend.component';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    AppComponent,
    ViewportComponent,
    LegendComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({
      network: network.reducer,
      region: region.reducer,
    }),
  ],
  providers: [SystemService],
  bootstrap: [AppComponent]
})
export class AppModule { }
