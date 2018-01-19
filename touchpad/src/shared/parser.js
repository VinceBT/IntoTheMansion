import React from 'react';
import Coordinate from "./coordinate";
import Map from "../model/map/map";
import Wall from "../model/map/wall";
import Floor from "../model/map/floor";

export default class Parser{
    constructor(json){
        this.json = json;
        this.player_coord;
        this.ghost_coord;
        this.width = this.json.terrain.width;
        this.height = this.json.terrain.height;
        this.floors = this.json.terrain.floors;
        this.map = new Map(this.width,this.height);
        this.fillEntities();
        //this.fillDoors();
        this.parse();
    }

    parse = () => {
        for(let i = 0; i < this.json.terrain.map[0].length; i ++){
            switch(this.json.terrain.map[0][i]){
                case 'W':
                    this.map[Math.floor(i/this.width)][i%this.width] = new Wall();
                    break;
                case 'F':
                    this.map[Math.floor(i/this.width)][i%this.width] = new Floor();
                    break;
                case 'D':
                    this.map[Math.floor(i/this.width)][i%this.width] = new Door();
                    break;
                default: break;
            }
        }
    }

    getMap = () => {
        return this.map;
    }

    getEntities = () => {
        return [this.player_coord,this.ghost_coord];
    }

    fillEntities = () => {
        this.player_coord = new Coordinate(this.json.player.spawn);
        this.ghost_coord = new Coordinate(this.json.ghost.spawn);
    }

    fillDoors = () => {
        for(let i = 0; i < this.json.objects.doors.length; i++) {
            const coord = this.json.objects.doors[i].position;
            const align = this.json.objects.doors[i].align;
            const id = this.json.objects.doors[i].id;
            this.map[coord[0]][coord[1]] = new Door(align,id);
        }
    }
}