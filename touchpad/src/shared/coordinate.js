import React from 'react';

export default class Coordinate{

    constructor(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.direction;
    }

    update = (x,y,z) => {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    copy = (coord) => {
        this.x = coord.x;
        this.y = coord.y;
        this.z = coord.z;
    }
}