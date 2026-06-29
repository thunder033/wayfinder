import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { network, region } from 'wf-core';

import { ViewportComponent } from './viewport.component';

describe('ViewportComponent', () => {
  let component: ViewportComponent;
  let fixture: ComponentFixture<ViewportComponent>;

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
    fixture = TestBed.createComponent(ViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
