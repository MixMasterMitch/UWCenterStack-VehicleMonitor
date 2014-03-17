var fs = require('fs');
var events = require('events');
var util = require('util');
var _ = require('underscore');

var FileWatcher = module.exports = function(filepath) {
    events.EventEmitter.call(this);

    // Parse filepath
	this.filepath = filepath;
	this.parentpath = filepath.substr(0, filepath.lastIndexOf('/'));
	this.filename = filepath.substr(filepath.lastIndexOf('/') + 1);
	
	// Fire a connected event if initially connected
	if (fs.existsSync(this.filepath)) {
		_.defer(_.bind(function() {
			this.emit('connected', this.filepath);
		}, this));
	}

	// Watch for changes to the filepath
	fs.watch(this.parentpath, _.bind(function(event, filename) {
		
		// We only want changes to filepath, not other files in the directory
		if (filename !== this.filename) {
			return;
		}

		// Determine if it was a connect, or disconnect
		if (fs.existsSync(this.filepath)) {
			this.emit('connected', this.filepath);
		} else {
			this.emit('disconnected', this.filepath);
		}

	}, this));
};
util.inherits(module.exports, events.EventEmitter);

FileWatcher.prototype.fileExists = function() {
    return fs.existsSync(this.filepath);
};