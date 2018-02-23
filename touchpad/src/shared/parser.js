function Parser(json){
        this.json = json;
        this.width = this.json.terrain.width;
        this.height = this.json.terrain.height;
        this.floors = this.json.terrain.floors;
        this.doors = this.json.doors;
        this.map = new Map(this.width,this.height);
        this.pcoord = json.player.spawn;
        this.gcoord = [json.ghosts[0].spawn,json.ghosts[1].spawn];
        this.parse();
}
    Parser.prototype = {

    parse: function(){
      var exit = [];
      for(var i = 0; i < this.json.objects.doors.length;i++){
        if(this.json.objects.doors[i].exit){
          exit.push(this.json.objects.doors[i].position);
        }
      }
        for(var i = 0; i < this.json.terrain.map.length; i ++){
            switch(this.json.terrain.map[i]){
                case 'W':
                    this.map.push(IntoTheMansion.WALL);
                    break;
                case 'F':
                    this.map.push(IntoTheMansion.FLOOR);
                    break;
                case 'D':
                    var done = false;
                    for(var k = 0; k < exit.length; k++) {
                        if (i == exit[k][0] + (exit[k][1]) * this.width) {
                            this.map.push(IntoTheMansion.EXIT);
                            done = true;
                        }
                    }
                    if(!done)
                        this.map.push(IntoTheMansion.DOOR);
                    break;
                default: break;
            }
        }
    }
}