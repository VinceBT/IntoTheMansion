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
      var exit;
      for(let i = 0; i < this.json.objects.doors.length;i++){
        if(this.json.objects.doors[i].exit){
          exit = this.json.objects.doors[i].position;
        }
      }
        for(let i = 0; i < this.json.terrain.map[0].length; i ++){
            switch(this.json.terrain.map[0][i]){
                case 'W':
                    this.map.push(IntoTheMansion.WALL);
                    break;
                case 'F':
                    this.map.push(IntoTheMansion.FLOOR);
                    break;
                case 'D':
                    if(i == exit[0] + (exit[1]) * this.width)
                      this.map.push(IntoTheMansion.EXIT);
                    else
                      this.map.push(IntoTheMansion.DOOR);
                    break;
                default: break;
            }
        }
    }
}