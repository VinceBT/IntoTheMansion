
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
}

Map.prototype = {
    push: function(element){
        this.tiles += element;
        if(this.current % this.width == 0)
            this.tiles += "\n";
        else
            this.tiles += ",";
        this.current++;
    }
}