import React from 'react';
import {Dimensions} from "react-native";

export default class Renderer{
    ctx: null;
    constructor(model,canvas){
        this.model = model;
        this.canvas = canvas;
        this.TILE_SIZE = 0;
        this.ctx;
    }
    initCanvas = () =>{
        this.TILE_SIZE = Math.floor(Dimensions.get('window').width/Math.min(this.model.map.length,this.model.map[0].length));
        this.ctx = this.canvas.getContext('2d');
    }
    drawMap = () => {
        //this.ctx.clearRect(0, 0, Dimensions.get('window').width,Dimensions.get('window').height);
        for(let x = 0; x < this.model.map.length; x ++){
            for(let y = 0; y < this.model.map[0].length;y++){
                this.ctx.fillStyle = this.model.map[x][y].color;
                this.ctx.fillRect(
                    x * this.TILE_SIZE, y * this.TILE_SIZE,
                    this.TILE_SIZE,this.TILE_SIZE
                );

            }
        }
    }
    updatePlayer = () => {
        this.ctx.clearRect(this.model.player.old_coord.x * this.TILE_SIZE, this.model.player.old_coord.y * this.TILE_SIZE, this.TILE_SIZE,this.TILE_SIZE);
        this.ctx.fillStyle = this.model.map[this.model.player.old_coord.y][this.model.player.old_coord.x].color;
        this.ctx.fillRect(
            this.model.player.old_coord.x * this.TILE_SIZE, this.model.player.old_coord.y * this.TILE_SIZE,
            this.TILE_SIZE,this.TILE_SIZE
        );
        this.ctx.fillStyle = this.model.player.color;
        this.ctx.fillRect(
            this.model.player.coord.x * this.TILE_SIZE,
            this.model.player.coord.y * this.TILE_SIZE,
            this.TILE_SIZE,
            this.TILE_SIZE,
        )
    }

    updateGhost = () => {
        this.ctx.clearRect(this.model.ghost.old_coord.x * this.TILE_SIZE, this.model.ghost.old_coord.y * this.TILE_SIZE, this.TILE_SIZE,this.TILE_SIZE);
        this.ctx.fillStyle = this.model.map[this.model.ghost.old_coord.y][this.model.ghost.old_coord.x].color;
        this.ctx.fillRect(
            this.model.ghost.old_coord.x * this.TILE_SIZE, this.model.ghost.old_coord.y * this.TILE_SIZE,
            this.TILE_SIZE,this.TILE_SIZE
        );
        this.ctx.fillStyle = this.model.ghost.color;
        this.ctx.fillRect(
            this.model.ghost.coord.x * this.TILE_SIZE ,
            this.model.ghost.coord.y * this.TILE_SIZE ,
            this.TILE_SIZE,
            this.TILE_SIZE,
        )
    }
}