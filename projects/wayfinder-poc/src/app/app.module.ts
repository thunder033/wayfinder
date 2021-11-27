import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SystemService } from './lib/system.service';
import { ViewportComponent } from './lib/viewport/viewport.component';
import { LegendComponent } from './lib/legend/legend.component';
import { StoreModule } from '@ngrx/store';
import { network } from '@wf-core/state/network.reducer';

@NgModule({
  declarations: [
    AppComponent,
    ViewportComponent,
    LegendComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({ network: network.reducer }),
  ],
  providers: [SystemService],
  bootstrap: [AppComponent]
})
export class AppModule { }
