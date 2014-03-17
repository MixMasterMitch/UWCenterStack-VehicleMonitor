# Include npm bin to path. This may not be necessary, but sometimes is an issue.
export PATH=$PATH:/usr/local/share/npm/bin

if [ $(uname) = Darwin ]; then

  # Prepares the repo for running on Mac
  alias uwcs-vm-init='uwcs-vm-global-modules ; uwcs-vm ; sudo npm install'

  NW_HOME=$UWCENTERSTACK_VEHICLE_MONITOR_HOME/node-webkit.app/Contents/MacOS
  export UWCENTERSTACK_VEHICLE_MONITOR_NW=$NW_HOME/node-webkit

else

  # Prepares the repo for running on Linux (Ubuntu 13.10)
  alias uwcs-vm-init='uwcs-vm-global-modules ; uwcs-vm-native-modules ; uwcs-vm ; sudo npm install ; ln -s /lib/x86_64-linux-gnu/libudev.so.1 $NW_HOME/libudev.so.0'

  NW_HOME=$UWCENTERSTACK_VEHICLE_MONITOR_HOME/nw
  export UWCENTERSTACK_VEHICLE_MONITOR_NW=$NW_HOME/nw

  export LD_LIBRARY_PATH=$NW_HOME:$LD_LIBRARY_PATH
fi

# uwcs-vm - Changes the current directory to the UWCenterStack repo directory
alias uwcs-vm='cd $UWCENTERSTACK_VEHICLE_MONITOR_HOME'

# uwcs-vm-global-modules - Installs any npm modules that we want to be globally accessable
alias uwcs-vm-global-modules='sudo npm i -g nw-gyp && sudo npm i -g grunt-cli && sudo npm i -g grunt'

# uwcs-vm-run - Runs the node-webkit vehicle apps in development mode with file watchers
alias uwcs-vm-run='uwcs-vm ; grunt run'

# uwcs-vm-run-fake - Same as run but with the TEST_CAN_EMITTER env variable
alias uwcs-vm-run-fake='uwcs-vm ; grunt fake'

uwcs-vm-native-modules() {
  uwcs-vm
  for module in `ls node_modules`;
  do
      uwcs-vm
      cd node_modules/$module
      if [ -s binding.gyp ]; then
        nw-gyp rebuild --target=0.8.5
      fi
  done
  uwcs-vm
}

# uwcs-vm-build - Builds the executable node-webkit vehicle apps
alias uwcs-vm-build='uwcs-vm ; grunt build'
