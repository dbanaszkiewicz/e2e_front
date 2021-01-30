import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { AlertsModule } from 'angular-alert-module';
import { GroupComponent } from './group/group.component';
import {CookieService} from 'ngx-cookie-service';
import { GroupListComponent } from './group-list/group-list.component';
import { NavbarComponent } from './navbar/navbar.component';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {StorageServiceModule} from 'angular-webstorage-service';
import { ModalComponent } from './modal/modal.component';
import { LoaderComponent } from './loader/loader.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ShareButtonsModule} from '@ngx-share/buttons';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {path: 'conversation/:id', pathMatch: 'full', component: GroupComponent},
  {path: '**', pathMatch: 'full', component: GroupComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    GroupComponent,
    GroupListComponent,
    NavbarComponent,
    ModalComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    HttpClientModule,
    AlertsModule.forRoot(),
    NgScrollbarModule,
    StorageServiceModule,
    BrowserAnimationsModule,
    ShareButtonsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
