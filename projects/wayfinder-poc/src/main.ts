import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { network, region } from 'wf-core';

import { AppComponent } from './app/app.component';
import { SystemService } from './app/lib/system.service';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      network: network.reducer,
      region: region.reducer,
    }),
    provideRouter([]),
    SystemService,
  ],
}).catch((err) => console.error(err));
