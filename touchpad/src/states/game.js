IntoTheMansion.Game = function() {
    this.skillmanager;
    this.skill;
    this.cursors;
    this.player;
    this.ghosts = [];
    this.entities = [];
    this.socket = io('http://localhost:8888');
};
IntoTheMansion.Game.prototype = {
    preload: function() {
        this.load.image('tiles', 'img/set.gif');
        this.load.image('player', 'img/ball.png');
        this.load.image('ghost', 'img/hole.png');
        this.load.image('trap', 'img/trap.png');
        this.load.spritesheet('remove-trap', 'img/remove-trap.png', 80, 80);
        this.load.spritesheet('remove-trap-active', 'img/remove-trap-active.png', 80, 80);
        var model = this;
        this.skillmanager = new SkillManager();

        this.socket.emit('REGISTER','TABLET');
        this.socket.emit('GET_MAP_DEBUG', function(data){
            var parser = new Parser(data);
            model.cache.addTilemap('dynamicMap', null, parser.map.tiles, Phaser.Tilemap.CSV);

            var map = model.add.tilemap('dynamicMap', IntoTheMansion._TILE_SIZE, IntoTheMansion._TILE_SIZE);
            map.addTilesetImage('tiles', 'tiles', IntoTheMansion._TILE_SIZE, IntoTheMansion._TILE_SIZE);

            var layer = map.createLayer(0);
            layer.resizeWorld();

            model.physics.startSystem(Phaser.Physics.ARCADE);
            model.skillmanager.add(new RemoveTrap(model,80,400));
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

        this.socket.on('GAME_OVER',function(json){
            if(!json.won)
                model.game.state.start('GameOver');
            else
                model.game.state.start('Victory');
        });
        
        this.socket.on('RESTART',function(json){
           model.game.state.start('Game');
        });
    },
    create: function() {
        //this.input.onTap.add(this.onTap, this);
    },
    onTap: function(pointer,doubleTap){
        for(var i = 0; i < pointer.interactiveCandidates.length; i++){
            if(pointer.interactiveCandidates[i].sprite != null)
                console.log(pointer.interactiveCandidates[i].sprite.key);
        }
        console.log(pointer,doubleTap);
    }
};
