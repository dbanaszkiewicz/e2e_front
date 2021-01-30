import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../services/api.service';
import {AlertsService} from 'angular-alert-module';
import {Subscription} from 'rxjs';
import {EventsService} from '../services/events.service';
import {SocketService} from '../services/socket.service';
import {RSAService} from '../services/rsa.service';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {

  id = null;
  messages = [];
  messageString: string;
  idParamSubscription: Subscription;
  socketMessageSubscription: Subscription;
  socketUserJoinSubscription: Subscription;
  socketUserLeaveSubscription: Subscription;
  groupInfo: GroupInfo = new GroupInfo();
  appClassRef = AppComponent;
  loading = true;
  static eventEmitter: EventEmitter<any> = new EventEmitter();

  userListOpened = false;
  addUserOpened = false;
  addUserLogin = '';
  addUserList = [];
  loadingMore = false;
  lastLoaded = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private alerts: AlertsService,
    private eventService: EventsService,
    private socketService: SocketService,
    private rsaService: RSAService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.idParamSubscription = this.route.params.subscribe((params: any) => {
      if (params && params.id) {
        this.id = params.id;
        GroupComponent.eventEmitter.emit({activeGroup: this.id});
        this.loadGroup();
      } else {
        this.id = null;
        this.loading = false;
      }
    });


  }

  reciveWS(obj: any) {
    if (this.id === obj.group.id) {
      this.apiService.readGroupMessages(this.id, obj.date).catch(reason => {
        console.log(reason);
      });
      this.addMessage(obj);
    }
  }

  addMessage(obj, toEnd = false) {
    let date = new Date(obj.date).toLocaleString();
    if (date.indexOf(new Date().toLocaleDateString()) === 0) {
      date = 'Dzisiaj, ' + date.substr(11);
    }

    let item = {
      user: obj.user,
      message: this.rsaService.decrypt(obj.message),
      time: date,
      date: obj.date,
      type: obj.type,
      my: obj.my
    };

    if (toEnd) {
      this.messages.push(item);
    } else {
      this.messages.unshift(item);
    }
  }

  loadGroup = () => {
    this.loading = true;
    this.apiService.getGroupInfo(this.id).then((value: any) => {
      this.groupInfo = value;

      this.messages = [];
      this.loadingMore = false;
      this.lastLoaded = null;
      setTimeout(() => {
      this.loading = false;
      }, 300);
      this.apiService.getLastMessages(this.id).then((value: any) => {
        for (let obj of value) {
          this.addMessage(obj);
        }

        this.apiService.readGroupMessages(this.id, value[value.length - 1].date).catch(reason => {
          console.log(reason);
        });

        const checkScroll = () => {
          let scroll = $('.message-container .ng-scroll-view').scrollTop() + $('.message-container .ng-scroll-view').height();
          if (scroll >= $('.scroll-messages').height() * 0.95) {
            if (!this.loadingMore) {
              this.loadingMore = true;
              this.loadMore();
            }
          }
          setTimeout(checkScroll, 200);
        };
        checkScroll();
      }).catch(reason => {
        if (reason.error && reason.error.error) {
          this.alerts.setMessage(reason.error.error.message, 'error');
          this.router.navigateByUrl('/');
        }
      });
    }).catch(reason => {
      if (reason.error && reason.error.error) {
        this.alerts.setMessage(reason.error.error.message, 'error');
        this.router.navigateByUrl('/');
      }
      this.id = null;
    });
  };

  ngOnInit() {
    this.lastLoaded = null;
    this.loadingMore = false;
    $('.message-container .ng-scroll-view').unbind('scroll');
    this.socketMessageSubscription = this.socketService.message.subscribe((val: any) => {
      this.reciveWS(val);
    });
    this.socketUserJoinSubscription = this.socketService.userJoinToGroup.subscribe((val: any) => {
      if (val.group === this.id) {
        this.groupInfo.users.push(val.user);
      }
    });

    this.socketUserLeaveSubscription = this.socketService.userLeaveGroup.subscribe((val: any) => {
      if (val.group === this.id) {
        let users = [];
        for (const u of this.groupInfo.users) {
          if (u.id !== val.user.id) {
            users.push(u);
          }
        }
        this.groupInfo.users = users;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    GroupComponent.eventEmitter.emit({activeGroup: ''});
    this.socketMessageSubscription.unsubscribe();
    this.socketUserJoinSubscription.unsubscribe();
    this.socketUserLeaveSubscription.unsubscribe();
  }

  keyup($event: any) {
    if ($event.keyCode === 13) {
      this.send();
    }
  }

  send() {
    let message = this.messageString;
    this.messageString = '';
    if (message.length > 0) {
      let data = [];

      for (let user of this.groupInfo.users) {
        if (user.public_key.length > 0) {
          this.socketService.sendMessage(this.id, user.id, this.rsaService.encrypt(user.public_key, message));
        }
      }
    }
  }

  removeFromGroup() {
    this.apiService.removeFromGroup(this.id).then(value => {
      this.alerts.setMessage('Opuściłeś grupę.', 'success');
      this.id = null;
      this.groupInfo.id = null;
      this.eventService.emit(EventsService.groupChange);
      this.router.navigateByUrl('/');
    }).catch(reason => {
      if (reason.error && reason.error.error) {
        this.alerts.setMessage(reason.error.error.message, 'error');
      }
    });
  }

  async loadMore() {
    if (this.messages.length > 0 && (this.lastLoaded === null || this.lastLoaded === 15)) {
      let lastDate = this.messages[this.messages.length - 1].date;

      let messages = await this.apiService.getLastMessages(this.id, lastDate);
      this.lastLoaded = messages.length;
      for (let obj of messages) {
        this.addMessage(obj, true);
      }
    }

    this.loadingMore = false;
  }

  closeAddUserModal() {
    this.addUserOpened = false;
    this.addUserLogin = '';
  }

  changeAddUser() {
    this.addUserList = [];
    if (this.addUserLogin.length > 2) {
      this.apiService.findNewUser(this.id, this.addUserLogin).then((value: any) => {
        this.addUserList = value;
      }).catch(reason => {
        if (reason.error && reason.error.error) {
          this.alerts.setMessage(reason.error.error.message, 'error');
        }
      });
    }
  }

  addUser(id: string) {
    this.apiService.addUserToGroup(this.id, id).then(value => {
      this.alerts.setMessage('Użytkownik został dodany do grupy.', 'success');
      this.closeAddUserModal();
    }).catch(reason => {
      if (reason.error && reason.error.error) {
        this.alerts.setMessage(reason.error.error.message, 'error');
      }
    });
  }


  joinToGroup() {
    $('.new-conversation').trigger('click');
  }

  newPrivMessage(id: string) {
    this.apiService.joinToGroup(id).then(value => {
      this.router.navigateByUrl('/conversation/' + value.id);
      this.userListOpened = false;
    });
  }
}


export class GroupInfo {
  'id': string = null;
  'name': string;
  'type': any;
  'public': boolean;
  'users': any;
}
