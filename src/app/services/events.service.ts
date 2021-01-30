import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  public static groupChange = 'groupChange';
  public static userChange = 'userChange';

  event: EventEmitter<string> = new EventEmitter();

  constructor() { }

  emit(value: string) {
    this.event.emit(value);
  }
}
