import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public userLogin(login: string, password: string, public_key: string): Promise<UserData> {
    return this.http.post('/api/user/login', {login, password, public_key}).toPromise() as any;
  }

  public changeUserData(oldPassword: string, password: string): Promise<UserData> {
    return this.http.post('/api/user/change', {oldPassword, password}).toPromise() as any;
  }

  public userGetData(): Promise<UserData> {
    return this.http.get('/api/user/get').toPromise() as any;
  }

  public findUser(login: string): Promise<UserData> {
    return this.http.get('/api/user/find?login=' + login).toPromise() as any;
  }
  public getAvailableGroupList(): Promise<any> {
    return this.http.get('/api/group/get-available').toPromise() as any;
  }
  public findNewUser(group_id, login): Promise<UserData> {
    return this.http.post('/api/group/find-new-user', {login, group_id}).toPromise() as any;
  }
  public addUserToGroup(group_id, user_id): Promise<UserData> {
    return this.http.post('/api/group/add-user', {user_id, group_id}).toPromise() as any;
  }
  public getLastMessages(gid: string, f_date = null): Promise<any[]> {
    if (f_date) {
      return this.http.get('/api/group/get-last-messages?group_id=' + gid + '&f_date=' + f_date).toPromise() as any;
    } else {
      return this.http.get('/api/group/get-last-messages?group_id=' + gid).toPromise() as any;
    }
  }
  public getGroupInfo(gid: string): Promise<UserData> {
    return this.http.get('/api/group/get?group_id=' + gid).toPromise() as any;
  }

  public joinToGroup(uid: string): Promise<any> {
    return this.http.put('/api/group/join', {user_id: uid}).toPromise();
  }

  public register(login: string, password: string, public_key: string): Promise<object> {
    return this.http.put('/api/user/register', {password, login, public_key}).toPromise();
  }

  public createGroup(name: string): Promise<object> {
    return this.http.put('/api/group/create', {name}).toPromise();
  }

  public removeFromGroup(groupId) {
      return this.http.post('/api/group/leave', {group_id: groupId}).toPromise();
  }

  public removeUser(password) {
      return this.http.post('/api/user/remove', {password}).toPromise();
  }

  public readGroupMessages(group_id, date): Promise<any> {
    return this.http.post('/api/group/read', {group_id, date}).toPromise() as any;
  }
}

export class UserData {
  id: string;
  login: string;
}
