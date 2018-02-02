var IntoTheMansion = {
     _WIDTH: 480,
    _HEIGHT: 720,
    _TILE_SIZE: 16,
    WALL: 323,
    DOOR: 270,
    FLOOR: 269,
    EXIT: 250
};
IntoTheMansion.Boot = function(game) {}

IntoTheMansion.Boot.prototype = {
    preload: function() {
    },
    create: function() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        //this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        //this.game.scale.startFullScreen(false);
        this.game.state.start('Preload');

    }
};