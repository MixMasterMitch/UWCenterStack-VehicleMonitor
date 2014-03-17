(function() {

    /**
     * Moves particles of variable size and speed around the screen. At a speed of 0 the particles move slowly in random
     * directions. At high speeds, they all move towards the bottom of the screen rapidly.
     *
     * Particles closer to the front or back have less opacity.
     *
     * @param element should be a canvas element.
     * @param numParticles will be the number of particles on the canvas at any time
     * @type {Function}
     */
    var VehicleMonitorCanvas = window.VehicleMonitorCanvas = function(element) {
        this.height = element.height();
        this.width = element.width();
        element.attr('height', this.height);
        element.attr('width', this.width);
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.ctx = element[0].getContext('2d');
        this.playing = false;

        this.ANIMATION_RATE = 0.01; // The rate values should approach their target
    };

    /**
     * While still playing, call render and wait for the next animation frame
     * @private
     */
    VehicleMonitorCanvas.prototype._loop = function() {
        if (this.playing) {
            webkitRequestAnimationFrame(_.bind(this._loop, this));
            this.render();
        }
    };

    /**
     * Starts the canvas animation.
     */
    VehicleMonitorCanvas.prototype.play = function() {
        this.playing = true;
        this._loop();
    };

    /**
     * Stops the canvas from being animated and rendered.
     */
    VehicleMonitorCanvas.prototype.stop = function() {
        this.playing = false;
    };

    /**
     * The function called on each iteration of the loop to update the canvas with the next frame.
     *
     * Implementing classes must implement.
     * @private
     */
    VehicleMonitorCanvas.prototype.render = function() {};

    /**
     * Combines the given color values into an rgba string.
     * @param r Red 0 - 255
     * @param g Green 0 - 255
     * @param b Blue 0 - 255
     * @param a Green 0 - 255
     * @returns {string} 'rgba(r, g, b, a)'
     * @private
     */
    VehicleMonitorCanvas.prototype._rgba = function(r, g, b, a) {
        return 'rgba(' + [r, g, b, a].join(', ') + ')';
    };

    /**
     * Copied from: http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
     *
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} radius The corner radius. Defaults to 5;
     * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
     * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
     */
    VehicleMonitorCanvas.prototype._roundRect = function(x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == "undefined" ) {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        radius = Math.min(Math.min(radius, width), height);
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        if (stroke) {
            this.ctx.stroke();
        }
        if (fill) {
            this.ctx.fill();
        }
    };
})();