var fs = require('fs');
var events = require('events');
var util = require('util');
var Timer = require('../utils/Timer.js');
var moment = require('moment');
var _ = require('underscore');
var FileWatcher = require('../utils/FileWatcher.js');

// Where log files should be written to
var CAN_LOGS_DRIVE = process.env.CAN_LOGS_DRIVE || '/media/uw-center-stack/CAN LOGS';

/**
 * Logs can messages every second to a file. Set the CAN_LOGS_DRIVE env variable to change where the logs
 * are created. Log files are named according to their start timestamp (e.g. 03-03-14 18_06_36.txt).
 *
 * The logger logs messages fired by the given canEventEmitter. See competition signals list in EcoCAR 2 non specirfic rules
 * for which signals it should be listening for and what they would be named.
 *
 * @type {Function}
 */
var CanLogger = module.exports = function(canEventEmitter) {
    events.EventEmitter.call(this);
    this.startTime;
    this.timer;

    // The mapping from header name to events and record of most up to date value;
    // time must be first column
    this.data = [
        {
            header: 'Time (s)',
            value: 0
        },
        {
            event: 'batteryCurrent',
            header: 'ESS Current (A)',
            value: 0
        },
        {
            event: 'batteryVoltage',
            header: 'ESS Voltage (V)',
            value: 0
        },
        {
            event: 'batteryVoltage',
            header: 'ESS Voltage (V)',
            value: 0
        },
        {
            event: 'batteryTemp',
            header: 'ESS Temperature (C)',
            value: 0
        },
        {
            event: 'batterySoc',
            header: 'ESS SOC (%)',
            value: 0
        },
        {
            event: 'engineTemp',
            header: 'Eng Temp (C)',
            value: 0
        },
        {
            event: 'motorTemp',
            header: 'P1 Motor Temp (C)',
            value: 0
        },
        {
            event: 'vehicleSpeed',
            header: 'Veh Spd (km/h)',
            value: 0
        },
        {
            event: 'engineRpm',
            header: 'Eng Spd (RPM)',
            value: 0
        },
        {
            event: 'engineTorque',
            header: 'Eng Trq (Nm)',
            value: 0
        },
        {
            event: 'motorRpm',
            header: 'P4 Motor Spd (RPM)',
            value: 0
        },
        {
            event: 'motorTorque',
            header: 'P4 Motor Trq (Nm)',
            value: 0
        },
        {
            event: 'vehicleAccel',
            header: 'Acc Ped Pos (%)',
            value: 0
        },
        {
            event: 'batteryVoltage',
            header: 'ESS Voltage (V)',
            value: 0
        },
        {
            event: 'transGear',
            header: 'gear',
            value: 0
        },
        {
            event: 'vehicleBrake',
            header: 'Brk Pos (1/0)',
            value: 0
        },
        {
            event: 'transRatio',
            header: 'Ratio',
            value: 0
        },
        {
            event: 'chargerVoltage',
            header: 'BRUSA AC Voltage (V)',
            value: 0
        },
        {
            event: 'chargerCurrent',
            header: 'BRUSA AC Current (A)',
            value: 0
        }
    ];

    this.LOG_FREQUENCY = 1000; // ms
    this.LOG_ACCURACY = 10; // ms +/- the second mark

    this._initializeEventHandlers(canEventEmitter);

    // Watch for the can logs drive to be added
    this.fileWatcher = new FileWatcher(CAN_LOGS_DRIVE)
        .on('connected', _.bind(function(filepath) {
            console.log('Connected: ' + filepath);

            // Wait a few seconds for the external drive
            // to be fully initialized before created log file
            setTimeout(_.bind(this._start, this), 1000);
        }, this))
        .on('disconnected', _.bind(function(filepath) {
            console.log('Disonnected: ' + filepath);

            this._stop();
        }, this));

    // Check if the file exists yet
    if (!this.fileWatcher.fileExists()) {
        _.defer(_.bind(function() {
            this.emit('noFile');
        }, this));
    }
};
util.inherits(CanLogger, events.EventEmitter);

/**
 * Create a new file on the can logs drive with a time stamped name
 * Returns the write stream
 */
CanLogger.prototype._createFile = function() {
    return fs.createWriteStream(CAN_LOGS_DRIVE + '/' + this.startTime.format('MM-DD-YY HH_mm_ss') + '.txt');
};

/**
 * Prints the tab delminated header row
 */
CanLogger.prototype._printHeader = function(writeStream) {
    _.each(this.data, function(column) {
        writeStream.write(column.header + '\t');
    });
    writeStream.write('\n');
};

/**
 * Prints a tab delminated data row of the most up to date data
 */
CanLogger.prototype._printData = function(writeStream) {
    this.data[0].value = moment().diff(this.startTime, 'seconds');
    _.each(this.data, function(column) {
        writeStream.write(column.value + '\t');
    });
    writeStream.write('\n');
};

/**
 * Attaches a handler for each columns event to the given CanEventEmitter to
 * save the event value.
 */
CanLogger.prototype._initializeEventHandlers = function(canEventEmitter) {
    _.each(this.data, function(column) {
        if (column.event) {
            canEventEmitter.on(column.event, _.bind(function(value) {
                column.value = value;
            }, this));
        }
    });
};

/**
 * Attempts to start logging if able to. Do not call start after calling the constructor because the constructor
 * starts logging for you.
 */
CanLogger.prototype.start = function() {
    if (this.startTime) { // We are already running
        return;
    }

    // Determine if we can start or not
    if (this.fileWatcher.fileExists()) {
        this._start();
    } else {
        this.emit('noFile');
    }
};

/**
 * Implements the start function
 * @private
 */
CanLogger.prototype._start = function() {
    this.startTime = moment();
    this.timer = new Timer();

    // Create file and output stream
    var out = this._createFile();

    this._printHeader(out);

    // Print data every second
    this.timer.setInterval(this.LOG_FREQUENCY, this.LOG_ACCURACY, _.bind(function() {
        this._printData(out);
    }, this));

    this.emit('start');
};

/**
 * Stops logging if it is currently logging. There is no way to append to a file
 * after it has been stopped. To start logging again to a new file, use the start function.
 */
CanLogger.prototype.stop = CanLogger.prototype._stop = function() {
    if (!this.startTime) { // We are already stopped
        return;
    }

    // Stop timer
    this.startTime = undefined;
    this.timer.clearInterval();

    this.emit('stop');
};