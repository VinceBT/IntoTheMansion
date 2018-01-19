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
        for(let y = 0; y < this.model.map.length;y++){
            for(let x = 0; x < this.model.map[0].length; x ++){
                this.ctx.fillStyle = this.model.map[y][x].color;
                this.ctx.fillRect(
                    x * this.TILE_SIZE, y * this.TILE_SIZE,
                    this.TILE_SIZE,this.TILE_SIZE
                );

            }
        }
    }
    clearCanvasArea = (coord) => {
        for(let y = Math.floor(coord.y)-2; y < Math.floor(coord.y)+2;y++) {
            for (let x = Math.floor(coord.x)-2; x < Math.floor(coord.x)+2; x++) {
                this.ctx.fillStyle = this.model.map[y][x].color;
                this.ctx.fillRect(
                    x * this.TILE_SIZE, y * this.TILE_SIZE,
                    this.TILE_SIZE, this.TILE_SIZE
                );
            }
        }
    }
    updatePlayer = () => {

        this.clearCanvasArea(this.model.player.old_coord);

        this.ctx.fillStyle = this.model.player.color;
        this.ctx.fillRect(
            this.model.player.coord.x * this.TILE_SIZE,
            this.model.player.coord.y * this.TILE_SIZE,
            this.TILE_SIZE,
            this.TILE_SIZE,
        )
    }

    updateGhost = () => {

        this.clearCanvasArea(this.model.ghost.old_coord);


        this.ctx.fillStyle = this.model.ghost.color;
        this.ctx.fillRect(
            this.model.ghost.coord.x * this.TILE_SIZE ,
            this.model.ghost.coord.y * this.TILE_SIZE ,
            this.TILE_SIZE,
            this.TILE_SIZE,
        )
    }
}