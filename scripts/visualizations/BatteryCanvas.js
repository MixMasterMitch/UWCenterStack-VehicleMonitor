(function() {
    var util = require('util');

    var Electron = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.speed = 0;
        this.radius = 0;
        this.opacity = 0;
    };

    /**
     * Displays a green arc representing a dial value. At a value of 100%, the dial does not connect, but rather
     * starts and ends near the bottom of the arc.
     *
     * @param element should be a canvas element
     * @type {Function}
     */
    var BatteryCanvas = window.BatteryCanvas = function(element) {
        VehicleMonitorCanvas.call(this, element);

        this.speed = 0;
        this.targetSpeed = 0;
        this.quantity = 0;
        this.targetQuantity = 0;
        this.soc = 0;
        this.targetSoc = 0;
        this.reverse = false;

        this.electrons = [];

        this.STROKE_WIDTH = 10; // The width of the outline of the battery
        this.CORNER_RADIUS = 16; // The radius of the battery corners
        this.NUM_ELECTRONS = 100; // The number of electrons at max quantity
        this.ELECTRON_RANGE = 80; // The width of the region the electrons can travel
        this.ELECTRON_MIN_SIZE = 10; // The minimum size of an electron
        this.ELECTRON_SIZE_FACTOR = 10; // The scale factor for an electron size (for random sizes)
        this.BATTERY_WIDTH = 150; // The width of the battery
        this.BATTERY_HEIGHT = 300; // The height of the battery
        this.SPEED_FACTOR = 8; // The scale factor for an electron size (for random speeds)
        this.MIN_SPEED = 5; // The minimum speed of an electron

        // Initialize electrons
        for (var i = 0; i < this.NUM_ELECTRONS; i++) {
            var electron = new Electron();

            // Random position
            electron.x = (Math.random() - 0.5) * this.ELECTRON_RANGE + this.centerX;
            electron.y = Math.random() * (this.centerY + this.BATTERY_HEIGHT / 2);
            electron.z = Math.random();

            // Random speed
            electron.speed = Math.random();

            // calculate properties
            electron.radius = Math.pow(electron.z, 3);
            electron.opacity = 1 - Math.abs((electron.z - 0.5) * 2); // Shift z range from -1 to 1, reverse it to go from 0 to 1 to 0

            this.electrons.push(electron);
        }
    };
    util.inherits(BatteryCanvas, VehicleMonitorCanvas);

    /**
     * Sets the speed electrons should be emitted at
     * @param speed Should be between 0 and 1
     */
    BatteryCanvas.prototype.setSpeed = function(speed) {
        this.targetSpeed = Math.max(Math.min(speed, 1), 0);
    };

    /**
     * Sets the quantity of electrons that should be emitted or absorbed
     * @param quantity Should be between 0 and 1
     */
    BatteryCanvas.prototype.setQuantity = function(quantity) {
        this.targetQuantity = Math.max(Math.min(quantity, 1), 0);
    };

    /**
     * Sets the direction of the electron travel. Forwards is out of the battery, reverse is into the battery
     * @param reverse Should be true to go in reverse, false to go forward
     */
    BatteryCanvas.prototype.setReverse = function(reverse) {
        this.reverse = reverse;
    };

    /**
     * Sets the quantity of charge in the battery
     * @param soc Should be between 0 and 1
     */
    BatteryCanvas.prototype.setSoc = function(soc) {
        this.targetSoc = Math.max(Math.min(soc, 1), 0);
    };

    /**
     * Implementation of abstract render function which draws and animates the electrons
     * @private
     */
    BatteryCanvas.prototype.render = function() {
        // clear contents
        this.ctx.clearRect(0, 0, this.width, this.height);

        var white = CONSTANTS.COLORS.WHITE;

        // draw electrons
        for (var i = 0; i < this.NUM_ELECTRONS * this.quantity; i++) {
            var electron = this.electrons[i];
            var radius = electron.radius * this.ELECTRON_SIZE_FACTOR + this.ELECTRON_MIN_SIZE;
            var electronRange = this.centerY + this.BATTERY_HEIGHT / 2;
            var opacity = electron.opacity * (1 - Math.abs(electron.y - electronRange / 2) * 2 / electronRange);

            this.ctx.fillStyle = this._rgba(white.r, white.g, white.b, opacity);
            this.ctx.beginPath();
            this.ctx.arc(electron.x, electron.y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

            // advance particle
            if (this.reverse) {
                electron.y = (electron.y + electron.speed * this.SPEED_FACTOR + this.MIN_SPEED + this.centerY + this.BATTERY_HEIGHT / 2) % (this.centerY + this.BATTERY_HEIGHT / 2);
            } else {
                electron.y = (electron.y - electron.speed * this.SPEED_FACTOR - this.MIN_SPEED + this.centerY + this.BATTERY_HEIGHT / 2) % (this.centerY + this.BATTERY_HEIGHT / 2);
            }
        }

        // draw battery outline
        this.ctx.strokeStyle = this._rgba(white.r, white.g, white.b, white.a);
        this.ctx.lineWidth = this.STROKE_WIDTH;
        this._roundRect(this.centerX - this.BATTERY_WIDTH / 2, this.centerY - this.BATTERY_HEIGHT / 2, this.BATTERY_WIDTH, this.BATTERY_HEIGHT, this.CORNER_RADIUS, false, true);
        this._roundRect(this.centerX - this.BATTERY_WIDTH / 7, this.centerY - this.BATTERY_HEIGHT / 2 - 2 * this.STROKE_WIDTH, this.BATTERY_WIDTH / 3.5, 2 * this.STROKE_WIDTH, this.STROKE_WIDTH / 2, false, true);

        // draw green battery fill
        var green = CONSTANTS.COLORS.GREEN;
        this.ctx.fillStyle = this._rgba(green.r, green.g, green.b, green.a);
        var fillMaxHeight = this.BATTERY_HEIGHT - 3 * this.STROKE_WIDTH;
        var fillWidth = this.BATTERY_WIDTH - 3 * this.STROKE_WIDTH;
        var fillHeight = fillMaxHeight * this.soc;
        var fillLeft = this.centerX - this.BATTERY_WIDTH / 2 + 1.5 * this.STROKE_WIDTH;
        var fillTop = this.centerY - this.BATTERY_HEIGHT / 2 + 1.5 * this.STROKE_WIDTH + fillMaxHeight - fillHeight;
        this._roundRect(fillLeft, fillTop, fillWidth, fillHeight, this.CORNER_RADIUS / 2, true, false);

        // advance animation
        this.speed += (this.targetSpeed - this.speed) * this.ANIMATION_RATE; // move speed closer to target
        this.quantity += (this.targetQuantity - this.quantity) * this.ANIMATION_RATE; // move quantity closer to target
        this.soc += (this.targetSoc - this.soc) * this.ANIMATION_RATE; // move soc closer to target
    };
})();