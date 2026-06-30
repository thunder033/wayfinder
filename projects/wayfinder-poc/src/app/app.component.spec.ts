import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { it } from 'vitest';
import { network, region } from 'wf-core';

import { AppComponent } from './app.component';
import { AppHarness } from './app.harness';

describe('AppComponent', () => {
  const setup = async () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    });

    const fixture = TestBed.createComponent(AppComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness);

    fixture.detectChanges();

    return { fixture, harness };
  };

  it('should create the app', async () => {
    const { fixture } = await setup();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should have as title 'wayfinder-poc'", async () => {
    const { fixture } = await setup();
    const app = fixture.componentInstance;
    expect(app.title).toEqual('wayfinder-poc');
  });

  it.skip('should render title', async () => {
    const { fixture } = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'wayfinder-poc app is running!',
    );
  });
});
