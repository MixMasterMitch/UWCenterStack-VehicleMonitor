(function() {
    var util = require('util');
    var events = require('events');
    var moment = require('moment');
    var CanLogger = require('../scripts/can/CanLogger.js');
    var CanReadWriter = require('uwcenterstack-canreadwriter');
    var EveBackend = require('uwcenterstack-evebackend');

    // initialize canvas
    var engineCanvas = new RotaryCanvas($('#engineCanvas'));
    var motorCanvas = new RotaryCanvas($('#motorCanvas'));
    var vehicleAccelCanvas = new DialCanvas($('#vehicleAccelCanvas'));
    var vehicleBrakeCanvas = new DialCanvas($('#vehicleBrakeCanvas'));
    var vehicleSpeedCanvas = new DialCanvas($('#vehicleSpeedCanvas'));
    var vehicleParticleCanvas = new ParticleCanvas($('#vehicleParticleCanvas'), 100);
    var batteryCanvas = new BatteryCanvas($('#batteryCanvas'));

    var canReadWriter = new CanReadWriter();

    if (process.env.FAKE_CAN) {

        // record key presses
        $(window).keydown(function(e) {
            switch (e.keyCode) {
                case 65: canReadWriter.accelPressed = true; break; // a
                case 66: canReadWriter.brakePressed = true; break; // b
                case 80: canReadWriter.inPark = true; break; // p
                case 67: canReadWriter.charging = true; break; // c
            }
        });
        $(window).keyup(function(e) {
            switch (e.keyCode) {
                case 65: canReadWriter.accelPressed = false; break; // a
                case 66: canReadWriter.brakePressed = false; break; // b
                case 80: canReadWriter.inPark = false; break; // p
                case 67: canReadWriter.charging = false; break; // c
            }
        });
    }

    // create mongoDB logger
    var mongoLogger = new EveBackend.CanLogger(canReadWriter);

    // keep fans always off
    setInterval(function() {
        canReadWriter.write('diagnosticMode', 1);
        canReadWriter.write('ventFanSpeed', 0);
    }, 1000);

    // create logger
    var canLogger = new CanLogger(canReadWriter);
    canLogger.on('start', function() {
        $('.log .status').text('Started at ' + moment().format('HH:mm:ss'));
        $('.log').addClass('logging');
    });
    canLogger.on('stop', function() {
        $('.log .status').text('Not Logging');
        $('.log').removeClass('logging');
    });
    canLogger.on('noFile', function() {
        $('.log .status').text('Missing "CAN LOGS" drive');
        $('.log').removeClass('logging');
    });

    // initialize all event handlers
    canReadWriter.on('batteryVoltage', function(batteryVoltage) {
        $('.batteryVoltage').text(batteryVoltage.toFixed(1) + ' V');
        batteryCanvas.setSpeed(batteryVoltage / 400);
    });

    canReadWriter.on('batteryCurrent', function(batteryCurrent) {
        $('.batteryCurrent').text(batteryCurrent.toFixed(1) + ' A');
        batteryCanvas.setQuantity(Math.abs(batteryCurrent / 400));
        if (batteryCurrent > 0) {
            batteryCanvas.setReverse(true);
        } else {
            batteryCanvas.setReverse(false);
        }
    });

    canReadWriter.on('batterySoc', function(batterySoc) {
        $('.batterySoc').text(batterySoc.toFixed(1) + ' %');
        batteryCanvas.setSoc(batterySoc / 100);
    });

    canReadWriter.on('batteryTemp', function(batteryTemp) {
        $('.batteryTemp').text(batteryTemp.toFixed(1) + ' C');
    });

    canReadWriter.on('motorRpm', function(motorRpm) {
        $('.motorRpm').text(motorRpm.toFixed(0));
        motorCanvas.setVelocity(motorRpm / 10000);
    });

    canReadWriter.on('motorTorque', function(motorTorque) {
        $('.motorTorque').text(motorTorque.toFixed(1) + ' Nm');
        motorCanvas.setRadius(Math.abs(motorTorque / 300));
    });

    canReadWriter.on('motorTemp', function(motorTemp) {
        $('.motorTemp').text(motorTemp.toFixed(1) + ' C');
        motorCanvas.setColorTemp(motorTemp / 100);
    });

    canReadWriter.on('transGear', function(transGear) {
        $('.transGear').text(transGear.toFixed(0));

        $('.transSection .gear').removeClass('selected');
        $('.transSection .driveExtra').hide();

        switch(Math.round(transGear)) {
            case -2:
                $('.transSection .park').addClass('selected');
                break;
            case -1:
                $('.transSection .reverse').addClass('selected');
                break;
            case 0:
                $('.transSection .neutral').addClass('selected');
                break;
            default:
                $('.transSection .drive').addClass('selected');
                $('.transSection .gearNumber').text(transGear.toFixed(0));
                $('.transSection .driveExtra').show();
                break;
        }
    });

    canReadWriter.on('transRatio', function(transRatio) {
        $('.transRatio').text(transRatio.toFixed(2));

        $('.transSection .gearRatio').text(transRatio.toFixed(2));
    });

    canReadWriter.on('engineRpm', function(engineRpm) {
        $('.engineRpm').text(engineRpm.toFixed(0));
        engineCanvas.setVelocity(engineRpm / 5000);
    });

    canReadWriter.on('engineTorque', function(engineTorque) {
        $('.engineTorque').text(engineTorque.toFixed(1) + ' Nm');
        engineCanvas.setRadius(engineTorque / 300);
    });

    canReadWriter.on('engineTemp', function(engineTemp) {
        $('.engineTemp').text(engineTemp.toFixed(1) + ' C');
        engineCanvas.setColorTemp(engineTemp / 100);
    });

    canReadWriter.on('vehicleAccel', function(vehicleAccel) {
        $('.vehicleAccel').text(vehicleAccel.toFixed(0) + ' %');
        vehicleAccelCanvas.setValue(vehicleAccel / 100);
        vehicleParticleCanvas.setSize(vehicleAccel / 100);
    });

    canReadWriter.on('vehicleBrake', function(vehicleBrake) {
        $('.vehicleBrake').text(vehicleBrake);
        if (vehicleBrake === 'yes') {
            vehicleBrakeCanvas.setValue(1);
        } else {
            vehicleBrakeCanvas.setValue(0);
        }
    });

    canReadWriter.on('vehicleSpeed', function(vehicleSpeed) {
        $('.vehicleSpeed').text(vehicleSpeed.toFixed(0) + ' km/hr');
        vehicleSpeedCanvas.setValue(vehicleSpeed / 100);
        vehicleParticleCanvas.setSpeed(vehicleSpeed / 100);
    });

    canReadWriter.on('chargerVoltage', function(chargerVoltage) {
        $('.chargerVoltage').text(chargerVoltage.toFixed(1) + ' V');
    });

    canReadWriter.on('chargerCurrent', function(chargerCurrent) {
        $('.chargerCurrent').text(chargerCurrent.toFixed(1) + ' A');
    });

    var blockFrame = 0;
    $('.navigationButton.up').click(function() {
        blockFrame = Math.max(blockFrame - 1, 0);
        $('.blocks').removeClass('position0 position1 position2').addClass('position' + blockFrame);
    });
    $('.navigationButton.down').click(function() {
        blockFrame = Math.min(blockFrame + 1, 2);
        $('.blocks').removeClass('position0 position1 position2').addClass('position' + blockFrame);
    });
    $('.navigationButton.up, .navigationButton.down').click(function() {
        $('.navigationButton.up').toggleClass('disabled', blockFrame === 0);
        $('.navigationButton.down').toggleClass('disabled', blockFrame === 2);
    });

    // go to section
    $('.block').click(function() {
        var section = $(this).attr('data-section');
        if (section) {

            // hide home
            $('h1, .home, .clock').addClass('hide');

            // show section
            $('.backButton, .' + section).removeClass('hide');
        }

        // start animation
        if (section === 'engineSection') {
            engineCanvas.play();
        } else if (section === 'motorSection') {
            motorCanvas.play();
        } else if (section === 'vehicleSection') {
            vehicleAccelCanvas.play();
            vehicleBrakeCanvas.play();
            vehicleSpeedCanvas.play();
            vehicleParticleCanvas.play();
        } else if (section === 'batterySection') {
            batteryCanvas.play();
        }
    });

    $('.log').click(function() {
        if ($(this).hasClass('logging')) {
            canLogger.stop();
        } else {
            canLogger.start();
        }
    });



    // go back to home screen
    $('.backButton').click(function() {

        // Hide sections
        $('.section, .backButton').addClass('hide');

        // show home
        $('h1, .home, .clock').removeClass('hide');

        // stop animations
        engineCanvas.stop();
        motorCanvas.stop();
        vehicleAccelCanvas.stop();
        vehicleBrakeCanvas.stop();
        vehicleSpeedCanvas.stop();
        vehicleParticleCanvas.stop();
        batteryCanvas.stop();
    });

    setInterval(function() {
        $('.clock').text(moment().format("h:mm a"));
    }, 100);

})();

CONSTANTS = {
    COLORS: {
        GREEN: {
            r: 0,
            g: 255,
            b: 0,
            a: 1
        },
        WHITE: {
            r: 210,
            g: 211,
            b: 212,
            a: 1
        }
    }
};
