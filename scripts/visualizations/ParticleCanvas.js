(function() {
    var util = require('util');

    /**
     * Particles are used by ParticleCanvas. They are represented on the screen as circles that move around the screen
     */
    var Particle = function() {
        this.x = 0;
        this.xSpeed = 0;
        this.y = 0;
        this.ySpeed = 0;
        this.z = 0;

        this.radius = 0;
        this.opacity = 0;
    };

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
    var ParticleCanvas = window.ParticleCanvas = function(element, numParticles) {
        VehicleMonitorCanvas.call(this, element);

        this.speed = 0;
        this.targetSpeed = 0;
        this.size = 0;
        this.targetSize = 0;
        this.particles = [];

        this.MIN_PARTICLE_SIZE = 8;
        this.SIZE_SCALE_FACTOR = 12;

        // Initialize particles
        for(var i = 0; i < numParticles; i++) {
            var particle = new Particle();

            // Random position
            particle.x = Math.random() * this.width;
            particle.y = Math.random() * this.height;
            particle.z = Math.random();

            // Random speed
            particle.xSpeed = Math.random() - 0.5;
            particle.ySpeed = Math.random() - 0.5;

            // calculate properties
            particle.radius = Math.pow(particle.z, 3);
            particle.opacity = 1 - Math.abs((particle.z - 0.5) * 2); // Shift z range from -1 to 1, reverse it to go from 0 to 1 to 0

            this.particles.push(particle);
        }
    };
    util.inherits(ParticleCanvas, VehicleMonitorCanvas);

    /**
     * The particles will grow or shrink in size proportional to size
     * @param size Should be between 0 and 1
     */
    ParticleCanvas.prototype.setSize = function(size) {
        this.targetSize = Math.max(Math.min(size, 1), 0);
    };

    /**
     * At a speed of 0 the particles move slowly in random directions. At high speeds, they all move towards the
     * bottom of the screen rapidly.
     * @param speed Should be between 0 and 1
     */
    ParticleCanvas.prototype.setSpeed = function(speed) {
        this.targetSpeed = Math.max(Math.min(speed, 1), 0);
    };

    /**
     * Implementation of abstract render function which draws and animates each particle
     * @private
     */
    ParticleCanvas.prototype.render = function() {
        // clear contents
        this.ctx.clearRect(0, 0, this.width, this.height);

        // draw particles
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            var radius = (particle.radius + this.size) * this.SIZE_SCALE_FACTOR + this.MIN_PARTICLE_SIZE;

            var white = CONSTANTS.COLORS.WHITE;
            this.ctx.fillStyle = this._rgba(white.r, white.g, white.b, particle.opacity);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

            // advance particle
            particle.x = (particle.x + particle.xSpeed) % this.width;
            particle.y = (particle.y + particle.ySpeed + this.speed * 20) % this.height;
        }

        // advance animation
        this.speed += (this.targetSpeed - this.speed) * this.ANIMATION_RATE; // move speed closer to target
        this.size += (this.targetSize - this.size) * this.ANIMATION_RATE; // move size closer to target
    };
})();