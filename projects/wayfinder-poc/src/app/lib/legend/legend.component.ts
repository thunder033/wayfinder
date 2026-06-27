import { NgStyle, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { SystemService } from '../system.service';

@Component({
  selector: 'wf-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  imports: [NgStyle, AsyncPipe],
})
export class LegendComponent implements OnInit {
  constructor(public systemService: SystemService) {}

  ngOnInit(): void {}
}
