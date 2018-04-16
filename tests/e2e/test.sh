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

      npm run selenium-install
      mkdir -p tests/reports/
    fi
}

function selenium_start {
    nohup npm run selenium-start > ./tests/reports/selenium.log 2>&1&
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

    add_test_users
}

function add_test_users {
    message "Adding test users..."
    cd ../mattermost-server
    PLATFORM_FILES=$( ls -1 ./cmd/platform/*.go | grep -v _test.go)

    echo "reset the database"
    go run $PLATFORM_FILES reset --confirm true

    # echo "adding 'admin' user"
    # go run $PLATFORM_FILES user create --email admin@test.com --username admin --password passwd
    echo "adding 'test' user"
    go run $PLATFORM_FILES user create --email test@test.com --username test --password passwd
    # echo "adding 'test2' user"
    # go run $PLATFORM_FILES user create --email test2@test.com --username test2 --password passwd
    # echo "adding 'test3' user"
    # go run $PLATFORM_FILES user create --email test3@test.com --username test3 --password passwd
    # echo "adding 'test4' user"
    # go run $PLATFORM_FILES user create --email test4@test.com --username test4 --password passwd
    echo "adding 'ui-automation' team"
    go run $PLATFORM_FILES team create --name ui-automation --display_name "UI Automation" --email "test@test.com"
    echo "adding users to 'ui-automation' team"
    go run $PLATFORM_FILES team add ui-automation test@test.com

    cd ../mattermost-webapp
    sleep 5
}

function skip_tutorial {
    message "Skipping tutorial for test users..."
    docker exec -i mattermost-mysql mysql -u mmuser -pmostest <<< "USE mattermost_test; UPDATE Preferences SET Value = '999' WHERE Category = 'tutorial_step';"
}

function local_tests {
    local_setup

    if [ -n "$1" ]; then
        message "Tag: ${1} local E2E starts..."
        skip_tutorial
        nightwatch -e chrome --suiteRetries 1 --tag $1
    else
        message "E2E full local chrome starts..."
        nightwatch -e chrome --suiteRetries 1

        message "E2E full local firefox starts..."
        nightwatch -e firefox --skiptags tutorial --suiteRetries 1
    fi
}

local_tests $@
