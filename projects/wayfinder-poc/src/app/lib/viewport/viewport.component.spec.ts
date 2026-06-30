import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { expect } from 'vitest';
import { network, region } from 'wf-core';

import { ViewportComponent } from './viewport.component';
import { ViewportHarness } from './viewport.harness';

describe('ViewportComponent', () => {
  const setup = async () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    });

    const fixture = TestBed.createComponent(ViewportComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ViewportHarness);

    fixture.detectChanges();

    return { fixture, harness };
  };
  it('should create', async () => {
    const ctx = await setup();

    expect(ctx.harness).toBeTruthy();

    expect(await ctx.harness.getCurrentYear()).toBe('1960');
  });
});
