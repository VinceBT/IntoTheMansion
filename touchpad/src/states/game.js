IntoTheMansion.Game = function() {
    this.skillmanager;
    this.player;
    this.map;
    this.layer;
    this.ghosts = [];
    this.entities = [];
    this.parser;
    this.circle;
    this.hasMap = false;
};
IntoTheMansion.Game.prototype = {
    preload: function() {
        var model = this;
        console.log(this);
            IntoTheMansion.socket.emit('GET_MAP', "mansion1", function (data) {
                model.parser = new Parser(data);
                model.cache.addTilemap('dynamicMap', null, model.parser.map.tiles, Phaser.Tilemap.CSV);
                model.map = model.add.tilemap('dynamicMap', IntoTheMansion._TILE_SIZE * 2, IntoTheMansion._TILE_SIZE * 2);
                model.map.addTilesetImage('tiles', 'tiles', IntoTheMansion._TILE_SIZE * 2, IntoTheMansion._TILE_SIZE * 2);

                model.layer = model.map.createLayer(0);
                model.game.scale.setGameSize(model.map.width * IntoTheMansion._TILE_SIZE * 2, model.map.height * IntoTheMansion._TILE_SIZE * 2);
                model.layer.resizeWorld();

                model.skillmanager = new SkillManager(model);
                model.input.addMoveCallback(model.draw, model);

                model.player = new Player(model,
                    model.parser.pcoord[0]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE,
                    model.parser.pcoord[1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE);

                model.ghosts.push(new Ghost(model,0,
                    model.parser.gcoord[0][0]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE,
                    model.parser.gcoord[0][1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE));
                model.ghosts.push(new Ghost(model,1,
                    model.parser.gcoord[1][0]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE,
                    model.parser.gcoord[1][1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE));

                model.circle = model.add.graphics(0,0);
                model.circle.lineStyle(1,0xffffff);
                model.circle.drawCircle(model.player.info.x,model.player.info.y,model.skillmanager.getRadius()*2);
                model.circle.visible = false;
                model.hasMap = true;
            });
        IntoTheMansion.socket.on('PLAYER_POSITION_UPDATE',function(json){
            if(!model.hasMap)return;
            else{
                model.player.info.visible = true;
                model.player.info.x = json.position[0]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE;
                model.player.info.y = json.position[1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE;
                model.player.info.angle = json.rotation.y*180/Math.PI;
                model.circle.x = model.player.info.x;
                model.circle.y = model.player.info.y;
            }
        });
        IntoTheMansion.socket.on('GHOST_POSITION_UPDATE',function(json){
            if(!model.hasMap)return;
            for(var i = 0; i < model.ghosts.length; i ++){
                if(model.ghosts[i].id == json.id){
                    model.ghosts[i].info.x = json.position[0]*IntoTheMansion._TILE_SIZE * 2 + IntoTheMansion._TILE_SIZE ;
                    model.ghosts[i].info.y = json.position[1]*IntoTheMansion._TILE_SIZE * 2 + IntoTheMansion._TILE_SIZE ;
                    break;
                }
            }

        });

        IntoTheMansion.socket.on('CREATE_TRAP',function(json){
            if(!model.hasMap)return;
            if(json.type != "DeathTrap") return;
            new Trap(
                    model,
                    json.id,
                    json.position[0]*IntoTheMansion._TILE_SIZE*2 +IntoTheMansion._TILE_SIZE ,
                    json.position[1]*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE
                    );
        });
        IntoTheMansion.socket.on('REMOVE_TRAP',function(json){
            for(var i = 0; i < model.entities.length;i++){
                if(model.entities[i].name == 'trap' && model.entities[i].id == json.id){
                    model.entities[i].info.destroy();
                    model.entities.splice(i,1);
                    break;
                }
            }

        });

        IntoTheMansion.socket.on('REQUEST_HELP',function(json){
            let notif = document.getElementsByClassName('helpText')[0];
            if(!notif.className.includes('helpTextActivated')) notif.className += ' helpTextActivated' ;

            let icon = document.getElementsByClassName('helpIcon')[0];
            if(!icon.className.includes('helpIconActivated')) icon.className += ' helpIconActivated' ;

            if(json.type === 'TRAP'){

                notif.innerText = 'The player needs help with a trap';
            }
            else if(json.type === 'DIRECTION'){
                notif.innerText = 'The player wants to know where to go';
            }

            setTimeout(() => {
                notif.innerText = "";
                notif.className = 'helpText';
                icon.className = 'helpIcon';
            }, 5000)

        });

        IntoTheMansion.socket.on('GAME_OVER',function(json){
            let endScreen = document.getElementsByClassName('endScreen')[0];

            if(!json.won) {
                if (!endScreen.className.includes('gameOver')) endScreen.className += ' gameOver';
                endScreen.innerHTML = "<p style='display: table-cell; vertical-align: middle'>GAME OVER!<br\>The explorer has been captured by the ghosts</p>";
            }
            else {
                if (!endScreen.className.includes('victory')) endScreen.className += ' victory';
                endScreen.innerHTML = "<p style='display: table-cell; vertical-align: middle'>Congratulations!<br\>The explorer has successfully escaped the mansion</p>";
            }
        });

        IntoTheMansion.socket.on('RESTART',function(json){
            //Reset victory screen
            document.getElementsByClassName('endScreen')[0].className = 'endScreen';
            document.getElementsByClassName('endScreen')[0].innerHTML = '';


            model.restart();
            model.game.state.restart();
            model.preload();
        });
    },
    debug_trap: function(id,x,y){
        new Trap(
            this,
            id,
            x*IntoTheMansion._TILE_SIZE*2 +IntoTheMansion._TILE_SIZE ,
            y*IntoTheMansion._TILE_SIZE*2 + IntoTheMansion._TILE_SIZE
        );
    },
    create: function() {
        this.stage.backgroundColor = "#66665e";
        new LoopListener(this);
    },
    draw: function(pointer,x,y){

        if(pointer.isDown && this.skillmanager.isShowPathActive() && this.parser.map.data[this.layer.getTileX(x)][this.layer.getTileY(y)]){
            var show = this.skillmanager.getShowPathSkill();
            if(
              !show.allowAdd(this.layer.getTileX(x),this.layer.getTileY(y),this) ||
              show.containsTile(this.layer.getTileX(x),this.layer.getTileY(y)))
                return;
            if(this.skillmanager.showpath.chrono == 0){
                this.skillmanager.showpath.chrono = 1;
            }
            if(!show.start){
                show.start = true;
                setTimeout(this.remove,show.timer,this);
            }
            show.tilesChanged.push([this.layer.getTileY(x),this.layer.getTileX(y)]);
            this.map.fill(IntoTheMansion.PATH, this.layer.getTileX(x), this.layer.getTileY(y), 1, 1);
            IntoTheMansion.socket.emit('PATH_CREATE',{x:this.layer.getTileX(x),z:this.layer.getTileY(y),y:0});
        }
    },
    remove: function(model){
        IntoTheMansion.socket.emit('REMOVE_PATH',{remove:true});
        var show = model.skillmanager.getShowPathSkill();
        for(var i = 0; i < show.tilesChanged.length;i++){
            model.map.fill(model.parser.map.data[show.tilesChanged[i][0]][show.tilesChanged[i][1]], show.tilesChanged[i][0], show.tilesChanged[i][1], 1, 1);
        }
        show.clearTiles();
        model.skillmanager.showpath.info.loadTexture(model.skillmanager.showpath.name, 0);
        model.skillmanager.showpath.chrono = 2;
        model.skillmanager.showpath.active = false;
        setTimeout(function(r){
            r.chrono = 0;
        },model.skillmanager.showpath.cooldown,model.skillmanager.showpath);
    },
    update: function(){
        if(!this.hasMap)return;
        if(this.skillmanager.reveal.chrono == 1){
            this.skillmanager.reveal.info.rotation+=0.1;
        }
        else if(this.skillmanager.reveal.chrono == 2) {
            this.skillmanager.reveal.info.rotation+=1;
        }
        else{
            this.skillmanager.reveal.info.rotation=0;
        }

        if(this.skillmanager.remove.chrono == 1){
            this.skillmanager.remove.info.rotation+=1;
        }
        else{
            this.skillmanager.remove.info.rotation=0;
        }

        if(this.skillmanager.showpath.chrono == 1){
            this.skillmanager.showpath.info.rotation+=0.1;
        }
        else if(this.skillmanager.showpath.chrono == 2){
            this.skillmanager.showpath.info.rotation+=1;
        }
        else{
            this.skillmanager.showpath.info.rotation=0;
        }
    },

    restart: function(){
        while(this.ghosts.length)this.ghosts.pop().info.destroy();

        while(this.entities.length)this.entities.pop().info.destroy();
        delete this.player;
        delete this.skillmanager;
        delete this.map;
        delete this.layer;
        delete this.hasMap;
    }
};
