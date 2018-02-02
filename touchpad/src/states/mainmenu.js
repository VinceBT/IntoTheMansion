IntoTheMansion.MainMenu = function() {};
IntoTheMansion.MainMenu.prototype = {
    create: function() {
        this.startButton = this.add.button(this.world.centerX, this.world.centerY, 'button-start', this.startGame, this, 2, 0, 1);
        this.startButton.anchor.set(0.5,0.5);
    },
    startGame: function() {
        this.game.state.start('Game');
    }
};