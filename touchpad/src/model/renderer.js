import React from 'react';
import {Dimensions} from "react-native";

export default class Renderer{
    constructor(model,ctx){
        this.model = model;
        this.ctx = ctx;
        this.cpt = 5;
        this.change = false;
    }

    draw = () => {
        if(this.cpt > 0){
            this.cpt--;
        }
        else{
            if(this.change) {
                this.ctx.fillStyle = 'purple';
                this.change = false;
            }else{
                this.ctx.fillStyle = 'blue';
                this.change = true;
            }
            this.cpt = 5;
            this.ctx.clearRect(0, 0, Dimensions.get('window').width,Dimensions.get('window').height);
            this.ctx.fillRect(0,0,Dimensions.get('window').width,Dimensions.get('window').height);
        }
        /*
        for(let x = 0; x < this.model.map.length; x ++){
            for(let y = 0; y < this.model.map[0].length;y++){
                //TODO
            }
        }
        */
    }
}