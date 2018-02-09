

var gameBootstrapper = {
    init:function(gameContainerElementId){

        var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, 'game');
        game.state.add('Boot', IntoTheMansion.Boot);
        game.state.add('Preload', IntoTheMansion.Preload);
        game.state.add('MainMenu', IntoTheMansion.MainMenu);
        game.state.add('Game', IntoTheMansion.Game);
        game.state.add('GameOver', IntoTheMansion.GameOver);
        game.state.add('Victory', IntoTheMansion.Victory);
        game.state.start('Boot');
    }
};
