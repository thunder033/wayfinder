import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { network, region } from 'wf-core';

import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { SystemService } from './app/lib/system.service';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, StoreModule.forRoot({
            network: network.reducer,
            region: region.reducer,
        })),
        SystemService
    ]
})
  .catch(err => console.error(err));
