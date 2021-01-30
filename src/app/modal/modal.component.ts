import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() opened = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  constructor(
      private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.changeDetectorRef.detectChanges();
  }

}
