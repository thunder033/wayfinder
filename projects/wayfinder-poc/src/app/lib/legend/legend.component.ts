import { NgStyle, AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';

import { SystemService } from '../system.service';

/**
 * Displays an overview the lines in the current system
 */
@Component({
  selector: 'wf-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  imports: [NgStyle, AsyncPipe],
})
export class LegendComponent {
  constructor(public systemService: SystemService) {}
}
