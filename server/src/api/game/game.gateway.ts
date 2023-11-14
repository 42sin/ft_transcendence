import { OnModuleInit } from "@nestjs/common";
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

//just playing wih socket
// @WebSocketGateway({
//     namespace: 'game',
//     cors: {
//         origin: '*'
//     }
// })
// export class GameGateway implements OnModuleInit {
//     @WebSocketServer()
//     server: Server;

//     onModuleInit() {
//         this.server.on('connection', (socket) => {
//             console.log(socket.id);
//             console.log('CONNECED');
//             // console.log(socket)
//         })
//     }
//     @SubscribeMessage('joinGame')
//     onNewJoin(@MessageBody() client: any)   {
//         console.log(client);
//         this.server.emit('onJoin', {
//             msg: 'joined Queue'
//         })
//     }

// }