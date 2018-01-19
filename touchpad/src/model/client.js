import React from 'react';
import SocketIOClient from 'socket.io-client';


export default class Client {
    constructor(url){
        this.url = url;
        this.socket = SocketIOClient(this.url);
    }

}
