function ShowPath(sm,x=-1, y=-1){
    this.name = "show-path";
    this.sm = sm;
    Skill.call(this);
    this.info = this.sm.model.add.button(x, y, this.name, this.onTap, this, 2, 0, 1);
    this.info.anchor.set(0,0);
    this.tilesChanged = [];
    this.info.input.useHandCursor = true;
    this.start = false;
    this.timer = 10000;
    this.tileLimit = 30;
}

ShowPath.prototype = {
    onTap: function(pointer,doubleTap){
        if(!this.active){
            this.sm.disableAll();
            this.info.loadTexture(this.name+'-active', 0);
            this.active = true;
        }
        else{
            this.info.loadTexture(this.name, 0);
            this.active = false;
        }
    },
    clearTiles: function(){
        this.start = false;
        while (this.tilesChanged.length) {
            this.tilesChanged.pop();
        }
    },

    containsTile: function(x,y){
        for(var i  = 0; i < this.tilesChanged.length;i++){
            if(this.tilesChanged[i][0] == x && this.tilesChanged[i][1] == y){
                return true;
            }
        }
        return false;
    },
    allowAdd: function(x,y,model){
        if(model.parser.map.data[x][y] == IntoTheMansion.FLOOR || model.parser.map.data[x][y] == IntoTheMansion.DOOR ){
            return true;
        }
        return false;
    }

}