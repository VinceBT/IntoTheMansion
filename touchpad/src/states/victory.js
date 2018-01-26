IntoTheMansion.Victory = function() {};
IntoTheMansion.Victory.prototype = {
    create: function() {
        var text = "Victory";
        var style = { font: "55px Arial", fill: "#ff0044", align: "center" };
        var t = this.add.text(60, this.world.centerY-100, text, style);
    }
};