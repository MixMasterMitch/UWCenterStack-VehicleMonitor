UWCenterStack-VehicleMonitor
============================

This is a utility tool to display the EcoCAR 2 competition signals in the center stack

Setup
-----

1. Install node.js from http://nodejs.org/ or if you have brew: brew install node
2. Install sass: http://sass-lang.com/install
3. Download node-webkit: https://github.com/rogerwang/node-webkit and place the node-webkit binary. For mac move the node-webkit application into the UWCenterStack-VehicleMonitor directory. On Linux, create a nw directory in UWCenterStack-VehicleMonitor and extract the contents of the downloaded package to this new folder.
4. Add to `~/.bash_profile` (Mac) or `~/.bashrc` (Linux):
```
export UWCENTERSTACK_VEHICLE_MONITOR_HOME=path/to/UWCenterStack-VehicleMonitor <-- REPLACE WITH CORRECT PATH!!!
source $UWCENTERSTACK_VEHICLE_MONITOR_HOME/shellCommands.sh
```
5. In a new terminal window, run:
```
uwcs-vm-init
```


Shell Commands
--------------

`uwcs-vm` - Changes the current directory to the UWCenterStack-VehicleMonitor repo directory

`uwcs-vm-global-modules` - Installs any npm modules that we want to be globally accessible

`uwcs-vm-init` - Prepares the repo for running on Mac or Linux (Ubuntu 13.10)

`uwcs-vm-run` - Runs the node-webkit vehicle apps in development mode with file watchers

`uwcs-vm-run-fake` - Same as run but using a fake CAN emitter (for use on Mac)

`uwcs-vm-build` - Builds the executable node-webkit vehicle apps

`uwcs-vm-native-modules` - Rebuilds the native modules for use with node-webkit

Developer Notes
---------------

###Organization

The node-webkit entry point is `html/index.html`. Any scripts in the window context should be loaded here.

Everything in `css` should be either generated from sass or be downloaded css that does not need editing.

`sass/main.scss` is the sass file that includes all of the other sass files. Styles for common components should go an a separate file for each component in the `common` folder. Styles specific to each app should go in the respective app's folder. Utility mixins should go in `_mixins.scss`.

The `scripts` folder is setup to mirror the `sass` folder. `main.js` is the Javascript entry point, each app has its own folder, common models and views are in `common`, downloaded dependencies are in `external`, and other modules (such as can and audio) should also have their own folder.

###Contexts
Anything that directly interacts with the DOM should be in the window context and loaded as a script tag in index.html.
Anything that interacts with hardware (the file system, audio, CAN) should be in the Node context and loaded through require().
