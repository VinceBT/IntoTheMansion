IntoTheMansion.GameOver = function() {};
IntoTheMansion.GameOver.prototype = {
    create: function() {
        var text = "Game Over";
        var style = { font: "55px Arial", fill: "#ff0044", align: "center" };
        var t = this.add.text(15, this.world.centerY-100, text, style);
    }
};