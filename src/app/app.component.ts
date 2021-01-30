import { Component } from '@angular/core';
import {UserData} from './services/api.service';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {AlertsService} from 'angular-alert-module';
import {AuthComponent} from './auth/auth.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  static userData: UserData = new UserData();
  user: UserData = new UserData();
  isLogged = false;
  loading = true;

  constructor(private router: Router,
              private alerts: AlertsService,
              private cookie: CookieService) {
      setTimeout(() => {
        $('#sidebar-toggle-label').animate({opacity: 1}, 500);
        $('.sidebar').animate({opacity: 1}, 500);
      }, 500);

      AuthComponent.changeStatus.subscribe((user: UserData) => {
        this.loading = false;
        this.user = user;
        AppComponent.userData = user;
        this.isLogged = (user.login !== null);
        setTimeout(() => {
          $('#sidebar-toggle-label').animate({opacity: 1}, 500);
          $('.sidebar').animate({opacity: 1}, 500);
        }, 500);
      });


  }

  logout() {
    this.cookie.delete('sid');
    let d = new Date();
    d.setTime(0);
    let expires = "expires="+ d.toUTCString();
    document.cookie = "sid=0;" + expires + ";path=/";
    AppComponent.userData = new UserData();
    this.user = new UserData();
    this.isLogged = false;
    this.router.navigateByUrl('');
    this.alerts.setMessage('Zostałeś pomyślnie wylogowany!', 'success');
  }
}
