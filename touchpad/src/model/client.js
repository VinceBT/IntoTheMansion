import React from 'react';
import {Alert} from 'react-native';
import SocketIOClient from 'socket.io-client';

export default class Client {
    constructor(url){
        this.url = url;
        this.socket = SocketIOClient(this.url);

    }

    init = () => {
        this.socket.once('HI', ()=> {
            alert('ok');
        });
        this.socket.emit('HI');
    }
}
