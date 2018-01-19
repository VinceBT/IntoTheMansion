import React from 'react';
import Ghost from "./entities/ghost";
import Player from "./entities/player";
import Renderer from "./renderer";
import {Alert} from "react-native";
import Parser from "../shared/parser";


export default class Model{

    constructor(client){
        this.client = client;
        this.map;
        this.player = new Player();
        this.ghost = new Ghost();
        this.renderer;
    }


    addRenderer(canvas){
        this.renderer = new Renderer(this,canvas);
    }

    startGame = (json) => {
        let parser = new Parser(json);
        this.map = parser.getMap();
        this.renderer.initCanvas();
        this.renderer.drawMap();
    }

    init = () =>{
        this.client.socket.emit('REGISTER','TABLET');
        this.client.socket.emit('GET_MAP_DEBUG',this.startGame);
        this.client.socket.on('PLAYER_POSITION_UPDATE',this.playerUpdate);
        this.client.socket.on('GHOST_POSITION_UPDATE',this.ghostUpdate);
        this.client.socket.on('DOOR_UPDATE',this.doorUpdate);
        this.client.socket.on('GAME_OVER',this.gameOver);
    }

    gameOver = (json) => {
        console.log(json);
    }

    doorUpdate = (json) => {
        console.log(json);
    }


    playerUpdate = (json) => {
        console.log("player update");
        this.player.updateCoordinate(json.position.x, json.position.z,json.position.y);
        this.renderer.updatePlayer();
    }
    ghostUpdate = (json) => {
        console.log("ghost update");
        this.ghost.updateCoordinate(json.position.x, json.position.z,json.position.y);
        this.renderer.updateGhost();
    }
}