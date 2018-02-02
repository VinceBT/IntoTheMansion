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
        this.socket = io('http://localhost:8080');
        var model = this;
        this.skillmanager = new SkillManager();
        this.socket.emit('REGISTER',{type: 'TABLET'});
        this.socket.emit('GET_MAP_DEBUG', function(data){
            model.parser = new Parser(data);
            model.cache.addTilemap('dynamicMap', null, model.parser.map.tiles, Phaser.Tilemap.CSV);

            model.map = model.add.tilemap('dynamicMap', IntoTheMansion._TILE_SIZE, IntoTheMansion._TILE_SIZE);
            model.map.addTilesetImage('tiles', 'tiles', IntoTheMansion._TILE_SIZE, IntoTheMansion._TILE_SIZE);

            model.layer = model.map.createLayer(0);
            model.layer.resizeWorld();

            model.physics.startSystem(Phaser.Physics.ARCADE);
            model.skillmanager = new SkillManager(model);
        });
        this.socket.on('PLAYER_POSITION_UPDATE',function(json){
            if(!model.player){
                model.player = new Player(model);
            }
            else{
                model.player.info.x = json.position.x*IntoTheMansion._TILE_SIZE;
                model.player.info.y = json.position.z*IntoTheMansion._TILE_SIZE;
            }
        });
        this.socket.on('GHOST_POSITION_UPDATE',function(json){
            if(model.ghosts.length < 2){
                if(model.ghosts.length == 0)
                    model.ghosts.push(new Ghost(model,json.player));

                else if(model.ghosts.length == 1 && model.ghosts[0].id != json.player)
                    model.ghosts.push(new Ghost(model,json.player));
            }
            for(var i = 0; i < model.ghosts.length; i ++){
                if(model.ghosts[i].id == json.player){
                    model.ghosts[i].info.x = json.position.x*IntoTheMansion._TILE_SIZE + IntoTheMansion._TILE_SIZE/2 ;
                    model.ghosts[i].info.y = json.position.z*IntoTheMansion._TILE_SIZE + IntoTheMansion._TILE_SIZE/2 ;
                    break;
                }
            }

        });

        this.socket.on('CREATE_TRAP',function(json){
            model.entities.push(
                new Trap(
                    model,
                    json.name,
                    json.player,
                    json.position.x*IntoTheMansion._TILE_SIZE + IntoTheMansion._TILE_SIZE/2,
                    json.position.z*IntoTheMansion._TILE_SIZE + IntoTheMansion._TILE_SIZE/2
                    ));
        });
        this.socket.on('REMOVE_TRAP',function(json){
            for(var i = 0; i < model.entities.length;i++){
                if(model.entities[i].name == 'trap' && model.entities[i].id == json.id){
                    this.model.entities[i].info.destroy();
                    this.model.entities.splice(i,1);
                    break;
                }
            }

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
        this.input.addMoveCallback(this.draw,this);
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
            show.tilesChanged.push([this.layer.getTileX(x),this.layer.getTileY(y)]);
            this.map.fill(1, this.layer.getTileX(x), this.layer.getTileY(y), 1, 1);
            this.socket.emit('PATH_CREATE',{x:this.layer.getTileX(x),y:this.layer.getTileY(y),z:0});
        }
    },
    remove: function(model){
        model.socket.emit('REMOVE_PATH',{remove:true});
        var show = model.skillmanager.getShowPathSkill();
        for(var i = 0; i < show.tilesChanged.length;i++){
            model.map.fill(model.parser.map.data[show.tilesChanged[i][0]][show.tilesChanged[i][1]], show.tilesChanged[i][0], show.tilesChanged[i][1], 1, 1);
        }
        show.clearTiles();
        model.skillmanager.disableAll();
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
