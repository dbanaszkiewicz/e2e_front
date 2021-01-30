import {Component, Input, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('animation', [
      state('visible', style({
        opacity: 0.75,
        display: 'block'
      })),
      state('invisible', style({
        opacity: 0,
        display: 'none'
      })),
      transition('visible => invisible', animate(300)),
      transition('invisible => visible', animate(50))
    ])
  ]
})
export class LoaderComponent implements OnInit {

  @Input() visible: boolean;

  constructor() {
  }

  ngOnInit() {
  }
}

