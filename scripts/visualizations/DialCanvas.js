(function() {
    var util = require('util');

    /**
     * Displays a green arc representing a dial value. At a value of 100%, the dial does not connect, but rather
     * starts and ends near the bottom of the arc.
     *
     * @param element should be a canvas element
     * @type {Function}
     */
    var DialCanvas = window.DialCanvas = function(element) {
        VehicleMonitorCanvas.call(this, element);

        this.value = 0;
        this.targetValue = 0;

        this.STROKE_WIDTH = 10;
    };
    util.inherits(DialCanvas, VehicleMonitorCanvas);

    /**
     * Sets the value the dial should animate to
     * @param value Should be between 0 and 1
     */
    DialCanvas.prototype.setValue = function(value) {
        this.targetValue = Math.max(Math.min(value, 1), 0);
    };

    /**
     * Implementation of abstract render function which draws and animates the dial
     * @private
     */
    DialCanvas.prototype.render = function() {
        // clear contents
        this.ctx.clearRect(0, 0, this.width, this.height);

        // set color
        var green = CONSTANTS.COLORS.GREEN;
        this.ctx.strokeStyle = this._rgba(green.r, green.g, green.b, green.a);


        // draw temperature stroke
        this.ctx.lineWidth = this.STROKE_WIDTH;
        this.ctx.beginPath();
        var startAngle = 2/3 * Math.PI;
        var endAngle = startAngle + this.value * 5/3 * Math.PI;
        this.ctx.arc(this.centerX, this.centerY, (this.height - this.STROKE_WIDTH) / 2, startAngle, endAngle);
        this.ctx.stroke();
        this.ctx.closePath();

        // advance animation
        this.value += (this.targetValue - this.value) * this.ANIMATION_RATE; // move value closer to target
    };
})();