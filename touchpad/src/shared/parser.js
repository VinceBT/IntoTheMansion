function Parser(json){

        this.json = json;
        this.width = this.json.terrain.width;
        this.height = this.json.terrain.height;
        this.floors = this.json.terrain.floors;
        this.map = new Map(this.width,this.height);
        this.parse();
}
    Parser.prototype = {

    parse: function(){
        for(let i = 0; i < this.json.terrain.map[0].length; i ++){
            switch(this.json.terrain.map[0][i]){
                case 'W':
                    this.map.push(323);
                    break;
                case 'F':
                    this.map.push(269);
                    break;
                case 'D':
                    this.map.push(270);
                    break;
                default: break;
            }
        }
    }
}