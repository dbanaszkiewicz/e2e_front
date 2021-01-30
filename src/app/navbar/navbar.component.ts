import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ApiService, UserData} from '../services/api.service';
import {AppComponent} from '../app.component';
import {AlertsService} from 'angular-alert-module';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  userData: UserData = null;
  openedSettings = false;

  changePassword = {
    old: '',
    new: '',
    repNew: ''
  };

  deletePass = '';
  @Output() logout: EventEmitter<any> = new EventEmitter()
  constructor(
    private alerts: AlertsService,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userData = AppComponent.userData;
  }

  closeSettings() {
    this.openedSettings = false;
  }

  changePasswordAction() {
    if (this.changePassword.old.length <= 3) {
      this.alerts.setMessage('Podane aktualne hasło jest nieprawidłowe!', 'error');
    } else if (this.changePassword.new.length <= 3) {
      this.alerts.setMessage('Podane nowe hasło jest nieprawidłowe!', 'error');
    } else if (this.changePassword.new !== this.changePassword.repNew) {
      this.alerts.setMessage('Wprowadzone hasła są różne!', 'error');
    } else {
      this.apiService.changeUserData(this.changePassword.old, this.changePassword.new).then(value => {
        this.alerts.setMessage('Twoje hasło zostało zmienione.', 'success');
        this.changePassword = {
          old: '',
          new: '',
          repNew: ''
        };
      }).catch(reason => {
        if (reason.error && reason.error.error) {
          this.alerts.setMessage(reason.error.error.message, 'error');
        }
      });
    }
  }

  deleteAccountAction() {
    if (this.deletePass.length <= 3) {
      this.alerts.setMessage('Podane aktualne hasło jest nieprawidłowe!', 'error');
    } else {
      this.apiService.removeUser(this.deletePass).then(value => {
        let d = new Date();
        d.setTime(0);
        let expires = "expires="+ d.toUTCString();
        document.cookie = "sid=0;" + expires + ";path=/";
        this.alerts.setMessage('Twoje konto zostało usunięte.', 'success');
        document.location.href = '/';
      }).catch(reason => {
        if (reason.error && reason.error.error) {
          this.alerts.setMessage(reason.error.error.message, 'error');
        }
      });
    }
  }
}
