import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as moment from 'moment-timezone';
import { Notification } from 'src/domain/notification/dto/notification.dto';

@WebSocketGateway({ cors: { origin: '*', allowedHeaders: '*', methods: '*' } })
export class ActiveUserSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private users = [];

  handleConnection(socket: any) {
    // console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: any) {
    this.users = this.users.filter((user) => user.id !== socket.id);
    this.server.emit('updateUserStatus', this.users);
    // console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('user_connected')
  handleUserConnected(@ConnectedSocket() socket: any, @MessageBody() user: any) {
    user.id = socket.id;
    user.time = moment().tz('Asia/Riyadh').format();

    if (this.users.filter((obj) => obj.uid === user.uid).length === 0)
      this.users.push(user);

    this.server.emit('updateUserStatus', this.users);
    // console.log('Users connected:', user.name);
  }

  updateEvent(type: String) {
    this.server.emit('update-event', type);
  }

  async sendNotification(notification: Notification) {
    this.server.emit('notification', notification);
  }
}

