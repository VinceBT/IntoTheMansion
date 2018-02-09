
function Door(){
    this.isOpen = false;
    this.color = "brown";
}

function Floor(){
    this.color = "white";
}

function Map(width,height){
    this.width = width;
    this.height = height;
    this.tiles = '';
    this.current = 1;
    this.data = [];
    for(var i = 0; i < this.height;i++){
        this.data.push(new Array(this.width));
    }
    this.x = 0;
    this.y = 0;
}

Map.prototype = {
    push: function(element){
        this.tiles += element;
        this.data[this.x][this.y] = element;
        if(this.current % this.width == 0) {
            this.tiles += "\n";
            this.x ++;
            this.y = 0;
        }
        else {
            this.tiles += ",";
            this.y ++;
        }
        this.current++;
    }
}