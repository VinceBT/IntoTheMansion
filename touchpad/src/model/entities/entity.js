import React from 'react';
import Coordinate from "../../shared/coordinate";

export default class Entity{
    constructor(){
       this.coord = new Coordinate();
       this.old_coord = new Coordinate();
    }

    updateCoordinate = (x,y,z) => {
        if(this.coord.x == 0 && this.coord.y == 0 && this.coord.z == 0){
            this.old_coord.update(x,y,z);
        }
        else{
            this.old_coord.copy(this.coord);
        }
        this.coord.update(x,y,z);
    }

}