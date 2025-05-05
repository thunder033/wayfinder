import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { expect } from 'vitest';

import { AppComponent, POSTS_ENDPOINT } from './app.component';
import { postsGrid, storeProvider } from '../lib/state';
import { TEST_POST } from '../lib/util/data.test-utils';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
      providers: [storeProvider, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Posts Grid');
  });

  it('should have as title "interview-posts-grid"', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('interview-posts-grid');
  });

  it('loads posts into the store', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const http = TestBed.inject(HttpTestingController);
    const store = TestBed.inject(Store);
    fixture.detectChanges();
    http.expectOne(POSTS_ENDPOINT).flush([TEST_POST({ id: 0 }), TEST_POST({ id: 1 })]);
    expect(store.selectSignal(postsGrid.selectAllPosts)()).toEqual({
      0: expect.objectContaining({ id: 0 }),
      1: expect.objectContaining({ id: 1 }),
    });
  });
});
