IntoTheMansion.Preload = function(){}
IntoTheMansion.Preload.prototype = {
    preload: function() {
        this.load.image('ball', 'img/ball.png');
        this.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
    },

    create: function(){
        this.game.state.start('MainMenu');

    }
}
