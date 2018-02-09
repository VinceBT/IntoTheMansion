IntoTheMansion.MainMenu = function() {};
IntoTheMansion.MainMenu.prototype = {
    create: function() {
       // this.startButton = this.add.button(this.game.camera.width / 2, this.game.camera.height / 2, 'button-start', this.startGame, this, 2, 0, 1);
        var text = "START";
        var style = { font: "bold 55px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var t = this.add.text(this.world.centerX, this.world.centerY, text, style);
        t.anchor.set(0.5,0.5);
        t.inputEnabled = true;
        t.events.onInputDown.add(this.startGame, this);
    },
    startGame: function() {
        this.game.scale.setGameSize(2000, 2000);
        this.game.state.start('Game');
    }
};