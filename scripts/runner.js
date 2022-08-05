// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// HARRISON remove some of these ignores
/* eslint-disable no-console, no-empty-function, no-unused-vars */

const {Writable} = require('stream');

const blessed = require('blessed');
const stripAnsi = require('strip-ansi');

function makeUi(filters, onFilter) {
    // Set up screen and output panes
    const screen = blessed.screen({
        smartCSR: true,
        dockBorders: true,
    });

    const output = blessed.box({
        top: 0,
        left: 0,
        width: '100%',
        height: '100%-3',
        content: 'THE END IS NEVER '.repeat(1000),
        tags: true,
        scrollable: true,
        style: {
        },
    });

    screen.append(output);

    // Set up the menu bar
    const menu = blessed.listbar({
        top: '100%-3',
        left: 0,
        width: '100%',
        height: 3,
        border: {
            type: 'line',
        },
        style: {
            item: {
                bg: 'red',
                hover: {
                    bg: 'green',
                },
            },
            selected: {
                bg: 'blue',
            },
        },
        tags: true,
        autoCommandKeys: true,
        mouse: true,
    });

    menu.add('All', () => onFilter(''));
    for (const filter of filters) {
        menu.add(filter, () => onFilter(filter));
    }

    screen.append(menu);

    // Other setup
    // TODO figure out where this belongs
    screen.key(['']);
    screen.key(['escape', 'q', 'C-c'], (/*ch, key*/) => {
        // TODO figure out how to exit gracefully when this happens
        // eslint-disable-next-line no-process-exit
        return process.exit(0);
    });

    return {
        menu,
        output,
        screen,
    };
}

function appendToBuffer(buffer, line) {
    // This regex is more complicated than expected because it
    const match = (/^\[([^\]]*)\]\s*(.*)$/).exec(stripAnsi(line));

    if (match) {
        buffer.push({tag: match[1], text: match[2]});
    } else {
        buffer.push({tag: '', text: 'Line not recognized correctly: ' + line});
    }
}

function makeRunner(commands) {
    let filter = '';
    function onFilter(newFilter) {
        filter = newFilter;

        renderUi();
    }

    const buffer = []; // It might make sense to set maximum bounds on this
    let partialBuffer = '';

    const ui = makeUi(commands.map((command) => command.name), onFilter);

    function formatLine(line) {
        const color = commands.find((command) => command.name === line.tag)?.prefixColor;

        return color ? `{bold}{${color}-fg}[${line.tag}]{/} ${line.text}` : `[${line.tag}] ${line.text}`;
    }

    function renderUi() {
        const filtered = buffer.filter((line) => filter === '' || line.tag === filter);

        ui.output.setContent(filtered.map(formatLine).join('\n'));
        ui.output.setScrollPerc(100);

        ui.screen.render();
    }

    const runnerOutput = new Writable({
        write(chunk, encoding, callback) {
            const str = String(chunk);

            if (str.includes('\n')) {
                const parts = str.split('\n');

                // Add completed lines to buffer
                appendToBuffer(buffer, partialBuffer + parts[0]);

                for (let i = 1; i < parts.length - 1; i++) {
                    appendToBuffer(buffer, parts[i]);
                }

                // Track partial line
                partialBuffer = parts[parts.length - 1];
            } else {
                // Track partial line
                partialBuffer += str;
            }

            renderUi();

            callback();
        },
    });

    renderUi();

    return runnerOutput;
}
exports.makeRunner = makeRunner;
