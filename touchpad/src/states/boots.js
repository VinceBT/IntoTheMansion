var IntoTheMansion = {
     _WIDTH: window.innerWidth * window.devicePixelRatio,
    _HEIGHT: window.innerHeight * window.devicePixelRatio,
    _TILE_SIZE: 16,
    _TILE_RENDERING:16,
    WALL: 11,
    DOOR: 47,
    FLOOR: 6,
    EXIT: 95,
    PATH: 1,
    socket : io('http://192.168.43.163:8080')
};
IntoTheMansion.Boot = function(game) {}
IntoTheMansion.Boot.prototype = {
    preload: function() {
        IntoTheMansion.socket.emit('REGISTER',{type: 'TABLET'});
    },
    create: function() {
        this.stage.disableVisibilityChange = true;                         //Not pause the game if the browser tab loses focus
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;               //Shows the entire game while maintaining proportions
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        this.game.scale.pageAlignHorizontally = true;                           //Align the game
        this.game.scale.pageAlignVertically = true;
        if (!this.game.device.desktop)                                     //In mobile force the orientation
        {
            this.game.scale.forceOrientation(true, false);
            this.game.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.game.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            if(this.game.scale.isGameLandscape){
                this.game.state.start('Preload');
            }
        }
        else{
            this.game.scale.setMaximum();
            this.game.state.start('Preload');
        }

    },
    enterIncorrectOrientation: function () {
        document.getElementById('rotate').style.display = 'block';
        document.getElementById('game').style.display = 'none';
        this.game.paused = true;
    },
    leaveIncorrectOrientation: function () {
        document.getElementById('game').style.display = 'block';
        document.getElementById('rotate').style.display = 'none';
        this.game.paused = false;
        if (!this.game.device.desktop){
            this.game.scale.setShowAll();
            this.game.scale.setMaximum();
            this.game.scale.startFullScreen(false);
            this.game.scale.refresh();
        }
        if(this.game.state.current == "Game"){
            this.game.state.restart();
        }
        else
            this.game.state.start('Preload');
    }
};