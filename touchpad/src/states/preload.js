IntoTheMansion.Preload = function(){}
IntoTheMansion.Preload.prototype = {
    preload: function() {
        this.load.image('ball', 'img/ball.png');
        this.load.spritesheet('button-start', 'img/button-start.png', 146, 51);
        this.load.image('tiles', 'img/tileset.png');
        this.load.image('player', 'img/ball.png');
        this.load.image('ghost', 'img/ghost.png');
        this.load.image('trap', 'img/trap.png');
        this.load.spritesheet('remove-trap', 'img/remove-trap.png', 80, 80);
        this.load.spritesheet('remove-trap-active', 'img/remove-trap-active.png', 80, 80);
        this.load.spritesheet('reveal', 'img/reveal.png', 80, 80);
        this.load.spritesheet('reveal-active', 'img/reveal-active.png', 80, 80);
        this.load.spritesheet('show-path', 'img/show-path.png', 80, 80);
        this.load.spritesheet('show-path-active', 'img/show-path-active.png', 80, 80);
        this.load.spritesheet('skills', 'img/skills.png', 80, 80);
        this.load.spritesheet('skills-active', 'img/skills-active.png', 80, 80);
        this.load.image("background", "img/start.jpg");
    },

    create: function(){
        this.game.state.start('MainMenu');

    }
}
