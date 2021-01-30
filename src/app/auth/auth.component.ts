import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ApiService, UserData} from '../services/api.service';
import { AlertsService } from 'angular-alert-module';
import {SocketService} from '../services/socket.service';
import {CookieService} from 'ngx-cookie-service';
import {RSAService} from '../services/rsa.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  static changeStatus: EventEmitter<UserData> = new EventEmitter();
  @Input() visible = false;

  loginData = {
    login: '',
    password: ''
  };

  registerData = {
    login: '',
    password: '',
    passwordr: '',
  };

  openedRegisterModal = false;

  constructor(private apiService: ApiService,
              private alerts: AlertsService,
              private ws: SocketService,
              public RSA: RSAService) {
    this.apiService.userGetData().then(value => {
      if (value.login !== null) {
        this.ws.connectToSocket(true);
      }
      AuthComponent.changeStatus.emit(value);
    }).catch(reason => {
      if (reason.error && reason.error.error) {
        this.alerts.setMessage(reason.error.error.message, 'error');
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  keyupLogin($event: any) {
    if ($event.keyCode === 13) {
      this.login();
    }
  }
  keyupRegister($event: any) {
    if ($event.keyCode === 13) {
      this.register();
    }
  }

  login = () => {
    this.apiService.userLogin(this.loginData.login, this.loginData.password, this.RSA.getPublicKey()).then(value => {
      AuthComponent.changeStatus.emit(value);
      this.ws.connectToSocket(true);
      this.loginData = {
        login: null,
        password: null
      };
    }).catch(reason => {
      if (reason.error && reason.error.error) {
        this.alerts.setMessage(reason.error.error.message, 'error');
      }
    });
  }

  getCookie = (name: string) => {
    const nameLenPlus = (name.length + 1);
    return document.cookie
        .split(';')
        .map(c => c.trim())
        .filter(cookie => {
          return cookie.substring(0, nameLenPlus) === `${name}=`;
        })
        .map(cookie => {
          return decodeURIComponent(cookie.substring(nameLenPlus));
        })[0] || null;
  }

  register = () => {
    if (this.registerData.password.length <= 3) {
      this.alerts.setMessage('Podane hasło jest za krótkie!', 'error');
    } else if (this.registerData.login.length <= 3) {
      this.alerts.setMessage('Podany login jest za krótki!', 'error');
    } else if (this.registerData.passwordr !== this.registerData.password) {
      this.alerts.setMessage('Wprowadzone hasła są różne!', 'error');
    } else {
      this.apiService.register(this.registerData.login, this.registerData.password, this.RSA.getPublicKey()).then(value => {
        this.alerts.setMessage('Konto zostało zarejestrowane.', 'success');
        this.registerData = {
          login: null,
          password: null,
          passwordr: null,
        };
        this.openedRegisterModal = false;
      }).catch(reason => {
        if (reason.error && reason.error.error) {
          this.alerts.setMessage(reason.error.error.message, 'error');
        }
      });
    }
  }

  generatePrivKey() {
    this.RSA.generateKey();
  }

  loadPrivKey() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pkey';

    input.onchange = (e: any) => {

      // getting a hold of the file reference
      const file = e.target.files[0];

      // setting up the reader
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      // here we tell the reader what to do when it's done reading...
      reader.onload = (readerEvent: any) => {
        this.RSA.setKey(readerEvent.target.result);
      };
    }

    input.click();
  }


  removeKey() {
    this.RSA.removeKey();
    this.alerts.setMessage('Klucz prywatny został usunięty!', 'success');
  }

  downloadKey() {
    this.RSA.getKey();
    this.alerts.setMessage('Rozpoczęto pobieranie kopii klucza prywatnego!', 'success');
  }
}
