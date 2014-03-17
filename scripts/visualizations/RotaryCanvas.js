(function() {
    var util = require('util');

    /**
     * Displays an proportional to the size with a color from blue to red representing a color. A white dot travels
     * around the arc at the set speed.
     *
     * @param element should be a canvas element
     * @type {Function}
     */
    var RotaryCanvas = window.RotaryCanvas = function(element) {
        VehicleMonitorCanvas.call(this, element);

        // current angle of the dot
        this.angle = 0;

        // angular velocity of the dot
        this.angularVelocity = 0;
        this.targetAngularVelocity = 0;

        // radius of the stroke that the dot revolves along
        this.strokeRadius = 0;
        this.targetStrokeRadius = 0;

        // temperature/color of the stroke
        this.targetTemp = 0;
        this.temp = 0;

        this.DOT_RADIUS = 4; // The radius of each dot
        this.TAIL_LENGTH = 200; // Number of dots on each side of the tail
        this.TAIL_SEPERATION = 0.01; // The number of frame times behind the prior dot
    };
    util.inherits(RotaryCanvas, VehicleMonitorCanvas);

    /**
     * Sets the temp color the stroke should animate to
     * @param value Should be between 0 (blue) and 1 (red)
     */
    RotaryCanvas.prototype.setColorTemp = function(temp) {
        this.targetTemp = Math.max(Math.min(temp, 1), 0);
    };

    /**
     * Sets the velocity of the dot
     * @param velocity Should be between 0 and 1
     */
    RotaryCanvas.prototype.setVelocity = function(velocity) {
        this.targetAngularVelocity = Math.max(Math.min(velocity, 1), 0);
    };

    /**
     * Sets the radius of the stroke
     * @param radius Should be between 0 and 1
     */
    RotaryCanvas.prototype.setRadius = function(radius) {
        this.targetStrokeRadius = Math.min(Math.max(radius * this.height / 2 - this.DOT_RADIUS, 0), this.height);
    };

    /**
     * Implementation of abstract render function which draws and animates the stroke and dot
     * @private
     */
    RotaryCanvas.prototype.render = function() {
        // clear contents
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw temperature stroke
        var r = Math.round(255 * this.temp);
        var g = 0;
        var b = 255 - r;
        var a = 0.5;
        this.ctx.strokeStyle = this._rgba(r, g, b, a);
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.strokeRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();

        // draw dot and tail
        for (var i = 0; i < this.TAIL_LENGTH; i++) {
            var tailDistance = this.TAIL_SEPERATION * i * this.angularVelocity; // How far this dot in the tail should be in radians

            var white = CONSTANTS.COLORS.WHITE;
            a = Math.pow(1-i/this.TAIL_LENGTH, 3); // each tail dot is cubicly fainter than the prior dot
            this.ctx.fillStyle = this._rgba(white.r, white.g, white.b, a);

            // draw trailing dot
            this.ctx.beginPath();
            var x = Math.cos(this.angle - tailDistance); // x position of the dot trailing
            var y = Math.sin(this.angle - tailDistance); // y position of the dot trailing
            this.ctx.arc(this.centerX + x * this.strokeRadius, this.centerY + y * this.strokeRadius, this.DOT_RADIUS, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

            // draw leading dot
            this.ctx.beginPath();
            x = Math.cos(this.angle + tailDistance); // x position of the dot leading
            y = Math.sin(this.angle + tailDistance); // y position of the dot leading
            this.ctx.arc(this.centerX + x * this.strokeRadius, this.centerY + y * this.strokeRadius, this.DOT_RADIUS, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        }

        // advance animation
        this.angle += this.angularVelocity;
        this.angularVelocity += (this.targetAngularVelocity - this.angularVelocity) * this.ANIMATION_RATE; // move velocity closer to target
        this.strokeRadius += (this.targetStrokeRadius - this.strokeRadius) * this.ANIMATION_RATE; // move radius closer to target
        this.temp += (this.targetTemp - this.temp) * this.ANIMATION_RATE; // move temp closer to target
    };
})();