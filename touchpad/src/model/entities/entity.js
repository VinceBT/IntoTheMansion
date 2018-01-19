import React from 'react';
import Coordinate from "../../shared/coordinate";

export default class Entity{
    constructor(){
       this.coord = new Coordinate();
       this.old_coord = new Coordinate();
    }

    updateCoordinate = (x,y,z) => {
        this.old_coord.copy(this.coord);
        this.coord.update(x,y,z);
    }

}