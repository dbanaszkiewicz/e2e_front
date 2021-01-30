import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../services/api.service';
import {AlertsService} from 'angular-alert-module';
import {Router} from '@angular/router';
import {GroupComponent} from '../group/group.component';
import {SocketService} from '../services/socket.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {

  groups: any[] = [];
  openedModal = false;
  activeGroup: string = '';
  socketMessageSubscription: Subscription;
  userLeaveGroupSubscription: Subscription;
  newGroupSubscription: Subscription;
  groupSearchString = '';
  groupSearchTimeout = null;

  newGroup = {
    name: '',
  };

  join = {
    user: '',
  };

  joinUserList = [];

  constructor(
      private apiService: ApiService,
      private changeDetectorRef: ChangeDetectorRef,
      private alerts: AlertsService,
      private router: Router,
      private socketService: SocketService
  ) { }

  ngOnInit() {
    this.apiService.getAvailableGroupList().then((res) => {
      this.groups = res;
    });

    GroupComponent.eventEmitter.subscribe(data => {
      if (data.activeGroup) {
        if (data.activeGroup !== this.activeGroup && this.activeGroup !== '') {
          for (let key in this.groups) {
            if (this.groups[key].id === this.activeGroup) {
              this.groups[key].newMessages = 0;

            }
          }
        }
        this.activeGroup = data.activeGroup;
      }
    });

    this.changeDetectorRef.detectChanges();

    this.socketMessageSubscription = this.socketService.message.subscribe((val: any) => {
      for (let key in this.groups) {
        if (this.groups[key].id === val.group.id) {
          this.groups[key].newMessages++;

          let g = this.groups[key];

          // this.groups.splice(+key, 1);
          // this.groups.unshift(g);
        }
      }
    });

    this.userLeaveGroupSubscription = this.socketService.leaveGroup.subscribe((val: any) => {
      for (let key in this.groups) {
        if (this.groups[key].id === val) {
          this.groups.splice(+key, 1);
        }
      }
    });

    this.newGroupSubscription = this.socketService.newGroup.subscribe((val: any) => {
      val.newMessages = 1;
      this.groups.unshift(val);
    });
  }

  ngOnDestroy(): void {
    this.socketMessageSubscription.unsubscribe();
    this.userLeaveGroupSubscription.unsubscribe();
    this.newGroupSubscription.unsubscribe();
  }

  openModal() {
    this.openedModal = true;
  }


  createGroup() {
    if (this.newGroup.name.length < 3) {
      this.alerts.setMessage('Nazwa grupy musi zawierać conajmniej 3 znaki!', 'error');
    } else {
      this.apiService.createGroup(this.newGroup.name).then((value: any) => {
        this.alerts.setMessage('Grupa została utworzona!', 'success');
        this.router.navigateByUrl('/conversation/' + value.id);
        this.groups.unshift(value);
        this.openedModal = false;
      })
    }
  }

  changeJoinUser() {
    this.joinUserList = [];

    if (this.join.user.length > 2) {
      this.apiService.findUser(this.join.user).then(value => {
        this.joinUserList = value as any;
      });
    }
  }

  writeToUser(uid) {
    this.apiService.joinToGroup(uid).then(value => {
      this.router.navigateByUrl('/conversation/' + value.id);
      this.openedModal = false;
      this.join.user = '';
    });
  }

  clearSearchString() {
    this.groupSearchString = '';
  }

  blurSearch() {
    this.groupSearchTimeout = setTimeout(() => {
      this.groupSearchString = '';
    }, 3000)
  }

  focusSearch() {
    if (this.groupSearchTimeout !== null) {
      clearTimeout(this.groupSearchTimeout);
    }
  }

  isVisible(name: string): boolean {
    return name.toLowerCase().indexOf(this.groupSearchString.toLowerCase()) >= 0;
  }
}
