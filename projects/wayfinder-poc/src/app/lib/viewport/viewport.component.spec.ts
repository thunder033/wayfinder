import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { network, region } from 'wf-core';

import { ViewportComponent } from './viewport.component';

describe('ViewportComponent', () => {
  let component: ViewportComponent;
  let fixture: ComponentFixture<ViewportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          network: network.reducer,
          region: region.reducer,
        }),
      ],
      declarations: [ViewportComponent],
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
