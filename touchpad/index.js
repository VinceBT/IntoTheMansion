
var gameBootstrapper = {
    init:function(gameContainerElementId){

        var game = new Phaser.Game(480, 720, Phaser.CANVAS, gameContainerElementId);
        game.state.add('Boot', IntoTheMansion.Boot);
        game.state.add('Preload', IntoTheMansion.Preload);
        game.state.add('MainMenu', IntoTheMansion.MainMenu);
        game.state.add('Game', IntoTheMansion.Game);
        game.state.add('GameOver', IntoTheMansion.GameOver);
        game.state.add('Victory', IntoTheMansion.Victory);
        game.state.start('Boot');
    }
};
