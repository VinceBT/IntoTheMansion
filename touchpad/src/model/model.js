import React from 'react';
import Ghost from "./entities/ghost";
import Player from "./entities/player";
import Renderer from "./renderer";
import {Alert} from "react-native";


export default class Model{

    constructor(client){
        this.client = client;
       this.map = new Map();
       this.player = new Player();
       this.ghost = new Ghost();
       this.renderer;
    }

    addRenderer(ctx){
        this.renderer = new Renderer(this,ctx);
    }

    update = (touches, screen, time ) => {
        if(this.renderer != undefined)
            this.renderer.draw();
    }


}