IntoTheMansion.GameOver = function() {};
IntoTheMansion.GameOver.prototype = {
    create: function() {
        var text = "Game Over";
        var style = { font: "bold 55px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var t = this.add.text(this.world.centerX, this.world.centerY, text, style);
        t.anchor.set(0.5,0.5);
    }
};