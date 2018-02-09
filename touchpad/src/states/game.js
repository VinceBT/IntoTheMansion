IntoTheMansion.Game = function() {
    this.skillmanager;
    this.player;
    this.map;
    this.layer;
    this.ghosts = [];
    this.entities = [];
    this.socket;
    this.parser;
};
IntoTheMansion.Game.prototype = {
    preload: function() {
        this.cpt = 0;
        this.socket = io('http://192.168.43.135:8080');
        var model = this;
        this.socket.emit('REGISTER',{type: 'TABLET'});
        this.socket.emit('GET_MAP',"mansion1", function(data){
            model.parser = new Parser(data);
            model.cache.addTilemap('dynamicMap', null, model.parser.map.tiles, Phaser.Tilemap.CSV);
            IntoTheMansion._TILE_RENDERING = window.innerWidth * window.devicePixelRatio/model.parser.map.width;
            model.map = model.add.tilemap('dynamicMap', IntoTheMansion._TILE_SIZE*2,IntoTheMansion._TILE_SIZE*2);
            model.map.addTilesetImage('tiles', 'tiles', IntoTheMansion._TILE_SIZE*2, IntoTheMansion._TILE_SIZE*2);

            model.layer = model.map.createLayer(0);
            model.game.scale.setGameSize(model.map.width*IntoTheMansion._TILE_SIZE*2, model.map.height*IntoTheMansion._TILE_SIZE*2);
            model.layer.resizeWorld();

            model.physics.startSystem(Phaser.Physics.ARCADE);
            model.skillmanager = new SkillManager(model);
            model.input.addMoveCallback(model.draw,model);
        });
        this.socket.on('PLAYER_POSITION_UPDATE',function(json){
            if(!model.player){
                model.player = new Player(model);
            }
            else{
                model.player.info.x = json.position[0]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE;
                model.player.info.y = json.position[1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE;
                model.player.info.angle = json.rotation.y*180/Math.PI;
            }
        });
        this.socket.on('GHOST_POSITION_UPDATE',function(json){
            if(model.ghosts.length < 2){
                if(model.ghosts.length == 0)
                    model.ghosts.push(new Ghost(model,json.id));

                else if(model.ghosts.length == 1 && model.ghosts[0].id != json.id)
                    model.ghosts.push(new Ghost(model,json.id));
            }
            for(var i = 0; i < model.ghosts.length; i ++){
                if(model.ghosts[i].id == json.id){
                    model.ghosts[i].info.x = json.position[0]*IntoTheMansion._TILE_SIZE * 2 + IntoTheMansion._TILE_SIZE ;
                    model.ghosts[i].info.y = json.position[1]*IntoTheMansion._TILE_SIZE * 2 + IntoTheMansion._TILE_SIZE ;
                    break;
                }
            }

        });

        this.socket.on('CREATE_TRAP',function(json){
            if(json.type != "DeathTrap") return;
            new Trap(
                    model,
                    json.name,
                    json.id,
                    json.position[0]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE/2,
                    json.position[1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE/2
                    );
            for(var i = 0; i < model.entities.length;i++){
                if(model.entities[i].name == 'trap'){
                    model.cpt ++;
                }
            }
        });
        this.socket.on('REMOVE_TRAP',function(json){
            for(var i = 0; i < model.entities.length;i++){
                if(model.entities[i].name == 'trap' && model.entities[i].id == json.id){
                    model.entities[i].info.destroy();
                    model.entities.splice(i,1);
                    break;
                }
            }

        });

        this.socket.on('REQUEST_HELP',function(json){
            let notif = document.getElementById('notification');
            if(json.type === 'TRAP'){
                notif.innerText = 'The player needs help with a trap';
            }
            else if(json.type === 'DIRECTION'){
                notif.innerText = 'The player wants to know where to go';
            }

            setTimeout(() => {
                notif.innerText = "";
            }, 5000)

        });

        this.socket.on('GAME_OVER',function(json){
            if(!json.won)
                model.game.state.start('GameOver');
            else
                model.game.state.start('Victory');
        });

        this.socket.on('RESTART',function(json){
            model.restart();
            model.game.state.restart();
            model.preload();
        });
    },
    create: function() {
        this.stage.backgroundColor = "#66665e";
    },
    draw: function(pointer,x,y){

        if(pointer.isDown && this.skillmanager.isShowPathActive() && this.parser.map.data[this.layer.getTileX(x)][this.layer.getTileY(y)]){

            var show = this.skillmanager.getShowPathSkill();
            if(
              !show.allowAdd(this.layer.getTileX(x),this.layer.getTileY(y),this) ||
              show.tilesChanged.length > show.tileLimit ||
              show.containsTile(this.layer.getTileX(x),this.layer.getTileY(y)))
                return;

            if(!show.start){
                show.start = true;
                setTimeout(this.remove,show.timer,this);
            }
            show.tilesChanged.push([this.layer.getTileY(x),this.layer.getTileX(y)]);
            this.map.fill(IntoTheMansion.PATH, this.layer.getTileX(x), this.layer.getTileY(y), 1, 1);
            this.socket.emit('PATH_CREATE',{x:this.layer.getTileX(x),z:this.layer.getTileY(y),y:0});
        }
    },
    remove: function(model){
        model.socket.emit('REMOVE_PATH',{remove:true});
        var show = model.skillmanager.getShowPathSkill();
        for(var i = 0; i < show.tilesChanged.length;i++){
            model.map.fill(model.parser.map.data[show.tilesChanged[i][0]][show.tilesChanged[i][1]], show.tilesChanged[i][0], show.tilesChanged[i][1], 1, 1);
        }
        show.clearTiles();
    },

    restart: function(){
        this.socket.disconnect();
        while(this.ghosts.length)this.ghosts.pop();
        while(this.entities.length)this.entities.pop();
        delete this.player;
        delete this.skillmanager;
        delete this.map;
        delete this.layer;
    }
};
