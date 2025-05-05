import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';

import { postsGrid } from '../lib/state';
import { GetPostsResponse } from '../lib/types/posts-grid';

export const POSTS_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'interview-posts-grid';

  constructor(private store: Store, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPostsData();
  }

  // contrived data load is here to demonstrate usage of NgRX
  // in a production app this would go into some kind of service based on the architecture needs
  loadPostsData() {
    this.http.get<GetPostsResponse>(POSTS_ENDPOINT).subscribe((data) => {
      data.forEach((post) => this.store.dispatch(postsGrid.loadPost({ post })));
    });
  }
}
