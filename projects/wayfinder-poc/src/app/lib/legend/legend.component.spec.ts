import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { network, region } from 'wf-core';

import { LegendComponent } from './legend.component';

describe('LegendComponent', () => {
  let component: LegendComponent;
  let fixture: ComponentFixture<LegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideStore({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
