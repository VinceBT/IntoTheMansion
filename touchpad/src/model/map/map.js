import React from 'react';

export default class Map extends Array{
    constructor(width,height){
        super(height);
        for(let i = 0; i < height; i ++){
            this[i] = new Array(width);
        }
    }
}
