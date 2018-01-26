function Coordinate (){
   this.x = 0;
    this.y = 0;
    this.z = 0;
    this.direction;
}

Coordinate.prototype = {
    update: function(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    },

    copy: function(coord){
        this.x = coord.x;
        this.y = coord.y;
        this.z = coord.z;
    }
}

