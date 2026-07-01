import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { expect } from 'vitest';
import { network, region } from 'wf-core';

import { LegendComponent } from './legend.component';
import { LegendHarness } from './legend.harness';
import { NetworkService } from '../network.service';

describe('LegendComponent', () => {
  const setup = async () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    });

    const fixture = TestBed.createComponent(LegendComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, LegendHarness);

    fixture.detectChanges();

    return { fixture, harness, network: TestBed.inject(NetworkService) };
  };

  it('displays the system name', async () => {
    const ctx = await setup();

    expect(await ctx.harness.getSystemName()).toBe('Test System A');
  });

  it('displays an entry for each line present in the current alteration', async () => {
    const ctx = await setup();

    let lines = await ctx.harness.lines();
    expect(lines).toHaveLength(1);
    expect(await lines[0].getName()).toBe('Red Line');
    expect(await lines[0].getColor()).toBe('rgb(184, 64, 64)');

    ctx.network.applyNextAlteration();
    ctx.network.applyNextAlteration(); // 3rd alteration has 2 lines
    ctx.fixture.detectChanges();

    lines = await ctx.harness.lines();
    expect(lines).toHaveLength(2);
    expect(await lines[0].getName()).toBe('Red Line');
    expect(await lines[1].getName()).toBe('Blue Line');
    expect(await lines[1].getColor()).toBe('rgb(54, 86, 197)');
  });
});
