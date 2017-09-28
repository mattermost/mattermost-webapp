#!/bin/bash
set -e

function message {
    echo ""
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo "#"  "$@"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo ""
}

function selenium_install {
    SELENIUM_DIR="./node_modules/selenium-standalone/.selenium/"

    if [ ! -d "$SELENIUM_DIR" ]; then

      if [ "$CI" != true ]; then
      message "Installing selenium..."
      fi

      yarn run selenium-install
      mkdir -p tests/reports/
    fi
}

function selenium_start {
    nohup yarn run selenium-start > ./tests/reports/selenium.log 2>&1&
}

function local_cleanup {
    message "Closing selenium server..."
    pkill -f selenium-standalone

    message "Done"
}

function local_setup {
    selenium_install

    message "Starting Selenium in background..."
    trap local_cleanup EXIT
    selenium_start
    sleep 5
}

function local_tests {
    local_setup

    if [ -n "$1" ]; then
        message "Tag: ${1} local E2E starts..."
        yarn run e2e-tag $1
    else
        message "E2E full local chrome starts..."
        yarn run e2e-local-chrome
        message "E2E full local firefox starts..."
        yarn run e2e-local-firefox
    fi
}

local_tests $@
