import {EventEmitter, Injectable} from '@angular/core';
import {AlertsService} from 'angular-alert-module';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    websocket: WebSocket = null;

    message: EventEmitter<any> = new EventEmitter();
    userJoinToGroup: EventEmitter<any> = new EventEmitter();
    leaveGroup: EventEmitter<any> = new EventEmitter();
    userLeaveGroup: EventEmitter<any> = new EventEmitter();
    newGroup: EventEmitter<any> = new EventEmitter();
    userLogin: string;
    sessionId: any = null;
    connecting = false;

    constructor(
        private alerts: AlertsService
    ) {
    }

    connectToSocket(silent = true) {
      if (!this.connecting) {
        this.connecting = true;
        const wsProtocol = (window.location.protocol !== 'https:') ? 'ws:' : 'wss:';
        this.websocket = new WebSocket(wsProtocol + '//' + window.location.href.split('/')[2] + '/api/ws');

        this.websocket.onopen = () => {
            if (!silent) {
                this.alerts.setMessage('Połączenie z socketem zostało wznowione.', 'success');
            }
          this.connecting = false;
        };

        this.websocket.onmessage = (event) => {
            const data: any = JSON.parse(event.data);
            if (data.message) {
                this.message.emit(data.message);
            }

            if (data.user_join) {
                this.userJoinToGroup.emit(data.user_join);
            }

            if (data.user_leave) {
                this.userLeaveGroup.emit(data.user_leave);
            }

            if (data.leave_group) {
                this.leaveGroup.emit(data.leave_group.group);
            }
            if (data.new_group) {
                this.newGroup.emit(data.new_group);
            }
        };

        let reconnect = () => {
            setTimeout(() => {
                this.connectToSocket(false);
            }, 500);
        };

        this.websocket.onclose = () => {
            this.alerts.setMessage('Połączenie z socketem zostało przerwane! Za chwilę zostanie podjęta próba kolejnego połączenia.', 'error');
            reconnect();
        };

        this.websocket.onerror = () => {
            this.alerts.setMessage('Połączenie z socketem nie zostało ustanowione! Za chwilę zostanie podjęta kolejna próba.', 'error');
            reconnect();
        }
      }

    }

    sendMessage(group: string, to_user: string, message: string) {
        if (this.websocket && this.websocket.readyState === this.websocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    send_message: {
                        group,
                        to_user,
                        message
                    }
                }));
        } else {
            this.connectToSocket(false);
        }
    }

}
