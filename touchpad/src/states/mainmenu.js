IntoTheMansion.MainMenu = function() {};
IntoTheMansion.MainMenu.prototype = {
    create: function() {
        this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
        var text = "START";
        var style = { font: "bold 70px creepster", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var b = this.game.add.tileSprite(0, 0, 748, 421, 'background');
        b.width = window.innerWidth;
        b.height = window.innerHeight;
        b.scale.setTo(((window.innerWidth/748)*360)/360, ((window.innerHeight/421)*360)/360);
        b.smooth = true;

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