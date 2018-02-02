IntoTheMansion.Preload = function(){}
IntoTheMansion.Preload.prototype = {
    preload: function() {
        this.load.image('ball', 'img/ball.png');
        this.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
        this.load.image('tiles', 'img/set.gif');
        this.load.image('player', 'img/ball.png');
        this.load.image('ghost', 'img/hole.png');
        this.load.image('trap', 'img/trap.png');
        this.load.spritesheet('remove-trap', 'img/remove-trap.png', 80, 80);
        this.load.spritesheet('remove-trap-active', 'img/remove-trap-active.png', 80, 80);
        this.load.spritesheet('show-path', 'img/show-path.png', 80, 80);
        this.load.spritesheet('show-path-active', 'img/show-path-active.png', 80, 80);
    },

    create: function(){
        this.game.state.start('MainMenu');

    }
}
