// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {createIntl} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';

import * as PostUtils from 'utils/post_utils.jsx';
import {PostListRowListIds} from 'utils/constants';
import EmojiMap from 'utils/emoji_map';

const enMessages = require('../i18n/en');

describe('PostUtils.containsAtChannel', () => {
    test('should return correct @all (same for @channel)', () => {
        for (const data of [
            {
                text: '',
                result: false,
            },
            {
                text: 'all',
                result: false,
            },
            {
                text: '@allison',
                result: false,
            },
            {
                text: '@ALLISON',
                result: false,
            },
            {
                text: '@all123',
                result: false,
            },
            {
                text: '123@all',
                result: false,
            },
            {
                text: 'hey@all',
                result: false,
            },
            {
                text: 'hey@all.com',
                result: false,
            },
            {
                text: '@all',
                result: true,
            },
            {
                text: '@ALL',
                result: true,
            },
            {
                text: '@all hey',
                result: true,
            },
            {
                text: 'hey @all',
                result: true,
            },
            {
                text: 'HEY @ALL',
                result: true,
            },
            {
                text: 'hey @all!',
                result: true,
            },
            {
                text: 'hey @all:+1:',
                result: true,
            },
            {
                text: 'hey @ALL:+1:',
                result: true,
            },
            {
                text: '`@all`',
                result: false,
            },
            {
                text: '@someone `@all`',
                result: false,
            },
            {
                text: '``@all``',
                result: false,
            },
            {
                text: '```@all```',
                result: false,
            },
            {
                text: '```\n@all\n```',
                result: false,
            },
            {
                text: '```````\n@all\n```````',
                result: false,
            },
            {
                text: '```code\n@all\n```',
                result: false,
            },
            {
                text: '~~~@all~~~',
                result: true,
            },
            {
                text: '~~~\n@all\n~~~',
                result: false,
            },
            {
                text: ' /not_cmd @all',
                result: true,
            },
            {
                text: '/cmd @all',
                result: false,
            },
            {
                text: '/cmd @all test',
                result: false,
            },
            {
                text: '/cmd test @all',
                result: false,
            },
            {
                text: '@channel',
                result: true,
            },
            {
                text: '@channel.',
                result: true,
            },
            {
                text: '@channel/test',
                result: true,
            },
            {
                text: 'test/@channel',
                result: true,
            },
            {
                text: '@all/@channel',
                result: true,
            },
            {
                text: '@cha*nnel*',
                result: false,
            },
            {
                text: '@cha**nnel**',
                result: false,
            },
            {
                text: '*@cha*nnel',
                result: false,
            },
            {
                text: '[@chan](https://google.com)nel',
                result: false,
            },
            {
                text: '@cha![](https://myimage)nnel',
                result: false,
            },
            {
                text: '@here![](https://myimage)nnel',
                result: true,
                options: {
                    checkAllMentions: true,
                },
            },
            {
                text: '@heree',
                result: false,
                options: {
                    checkAllMentions: true,
                },
            },
            {
                text: '=@here=',
                result: true,
                options: {
                    checkAllMentions: true,
                },
            },
            {
                text: '@HERE',
                result: true,
                options: {
                    checkAllMentions: true,
                },
            },
            {
                text: '@here',
                result: false,
                options: {
                    checkAllMentions: false,
                },
            },
        ]) {
            const containsAtChannel = PostUtils.containsAtChannel(data.text, data.options);

            assert.equal(containsAtChannel, data.result, data.text);
        }
    });
});

describe('PostUtils.shouldFocusMainTextbox', () => {
    test('basic cases', () => {
        for (const data of [
            {
                event: null,
                expected: false,
            },
            {
                event: {},
                expected: false,
            },
            {
                event: {ctrlKey: true},
                activeElement: {tagName: 'BODY'},
                expected: false,
            },
            {
                event: {metaKey: true},
                activeElement: {tagName: 'BODY'},
                expected: false,
            },
            {
                event: {altKey: true},
                activeElement: {tagName: 'BODY'},
                expected: false,
            },
            {
                event: {},
                activeElement: {tagName: 'BODY'},
                expected: false,
            },
            {
                event: {key: 'a'},
                activeElement: {tagName: 'BODY'},
                expected: true,
            },
            {
                event: {key: 'a'},
                activeElement: {tagName: 'INPUT'},
                expected: false,
            },
            {
                event: {key: 'a'},
                activeElement: {tagName: 'TEXTAREA'},
                expected: false,
            },
            {
                event: {key: '0'},
                activeElement: {tagName: 'BODY'},
                expected: true,
            },
            {
                event: {key: '!'},
                activeElement: {tagName: 'BODY'},
                expected: true,
            },
            {
                event: {key: ' '},
                activeElement: {tagName: 'BODY'},
                expected: true,
            },
            {
                event: {key: 'BACKSPACE'},
                activeElement: {tagName: 'BODY'},
                expected: false,
            },
        ]) {
            const shouldFocus = PostUtils.shouldFocusMainTextbox(data.event, data.activeElement);
            assert.equal(shouldFocus, data.expected);
        }
    });
});

describe('PostUtils.postMessageOnKeyPress', () => {
    // null/empty cases
    const emptyCases = [{
        name: 'null/empty: Test for null event',
        input: {event: null, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'null/empty: Test for empty message',
        input: {event: {}, message: '', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'null/empty: Test for shiftKey event',
        input: {event: {shiftKey: true}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'null/empty: Test for altKey event',
        input: {event: {altKey: true}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }];

    for (const testCase of emptyCases) {
        it(testCase.name, () => {
            const output = PostUtils.postMessageOnKeyPress(
                testCase.input.event,
                testCase.input.message,
                testCase.input.sendMessageOnCtrlEnter,
                testCase.input.sendCodeBlockOnCtrlEnter,
                0,
                0,
                testCase.input.message.length,
            );

            expect(output).toEqual(testCase.expected);
        });
    }

    // no override case
    const noOverrideCases = [{
        name: 'no override: Test no override setting',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'no override: empty message',
        input: {event: {keyCode: 13}, message: '', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'no override: empty message on ctrl + enter',
        input: {event: {keyCode: 13}, message: '', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }];

    for (const testCase of noOverrideCases) {
        it(testCase.name, () => {
            const output = PostUtils.postMessageOnKeyPress(
                testCase.input.event,
                testCase.input.message,
                testCase.input.sendMessageOnCtrlEnter,
                testCase.input.sendCodeBlockOnCtrlEnter,
                0,
                0,
                testCase.input.message.length,
            );

            expect(output).toEqual(testCase.expected);
        });
    }

    // on sending of message on Ctrl + Enter
    const sendMessageOnCtrlEnterCases = [{
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, no ctrlKey|metaKey',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```\nfunc(){}', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```\nfunc(){}\n', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, no ctrlKey|metaKey, with opening and closing backticks',
        input: {event: {keyCode: 13}, message: '```\nfunc(){}\n```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: false},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey',
        input: {event: {keyCode: 13, ctrlKey: true}, message: 'message', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with metaKey',
        input: {event: {keyCode: 13, metaKey: true}, message: 'message', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening backticks, with language set',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```\n', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```\nfunction(){}', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true, message: '```\nfunction(){}\n```', withClosedCodeBlock: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening backticks, with line break on last line',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```\nfunction(){}\n', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true, message: '```\nfunction(){}\n```', withClosedCodeBlock: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening backticks, with multiple line breaks on last lines',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```\nfunction(){}\n\n\n', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true, message: '```\nfunction(){}\n\n\n```', withClosedCodeBlock: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening and closing backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```\nfunction(){}\n```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with opening and closing backticks, with language set',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\nfunction(){}\n```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendMessageOnCtrlEnter: Test for overriding sending of message on CTRL+ENTER, with ctrlKey, with inline opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '``` message', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }];

    for (const testCase of sendMessageOnCtrlEnterCases) {
        it(testCase.name, () => {
            const output = PostUtils.postMessageOnKeyPress(
                testCase.input.event,
                testCase.input.message,
                testCase.input.sendMessageOnCtrlEnter,
                testCase.input.sendCodeBlockOnCtrlEnter,
                0,
                0,
                testCase.input.message.length,
            );

            expect(output).toEqual(testCase.expected);
        });
    }

    // on sending and/or closing of code block on Ctrl + Enter
    const sendCodeBlockOnCtrlEnterCases = [{
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, no ctrlKey|metaKey, without opening backticks',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: false},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```javascript', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: false},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```javascript\n', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: false},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, no ctrlKey|metaKey, with opening backticks',
        input: {event: {keyCode: 13}, message: '```javascript\n    function(){}', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: false},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, without opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with metaKey, without opening backticks',
        input: {event: {keyCode: 13, metaKey: true}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with line break',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '\n', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with multiple line breaks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '\n\n\n', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks, with language set',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening and closing backticks, with language set',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\n    function(){}\n```', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening and closing backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```\n    function(){}\n```', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks, with last line of empty spaces',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\n    function(){}\n    ', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true, message: '```javascript\n    function(){}\n    \n```', withClosedCodeBlock: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks, with empty line break on last line',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\n    function(){}\n', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true, message: '```javascript\n    function(){}\n```', withClosedCodeBlock: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks, with multiple empty line breaks on last lines',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\n    function(){}\n\n\n', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true, message: '```javascript\n    function(){}\n\n\n```', withClosedCodeBlock: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks, with multiple empty line breaks and spaces on last lines',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\n    function(){}\n    \n\n    ', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true, message: '```javascript\n    function(){}\n    \n\n    \n```', withClosedCodeBlock: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with opening backticks, without line break on last line',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '```javascript\n    function(){}', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true},
        expected: {allowSending: true, message: '```javascript\n    function(){}\n```', withClosedCodeBlock: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with inline opening backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '``` message', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: false},
        expected: {allowSending: true},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, no ctrlKey|metaKey, with cursor between backticks',
        input: {event: {keyCode: 13, ctrlKey: false}, message: '``` message ```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: true, cursorPosition: 5},
        expected: {allowSending: false},
    }, {
        name: 'sendCodeBlockOnCtrlEnter: Test for overriding sending of code block on CTRL+ENTER, with ctrlKey, with cursor between backticks',
        input: {event: {keyCode: 13, ctrlKey: true}, message: '``` message ```', sendMessageOnCtrlEnter: true, sendCodeBlockOnCtrlEnter: true, cursorPosition: 5},
        expected: {allowSending: true},
    }];

    for (const testCase of sendCodeBlockOnCtrlEnterCases) {
        it(testCase.name, () => {
            const output = PostUtils.postMessageOnKeyPress(
                testCase.input.event,
                testCase.input.message,
                testCase.input.sendMessageOnCtrlEnter,
                testCase.input.sendCodeBlockOnCtrlEnter,
                0,
                0,
                testCase.input.cursorPosition ? testCase.input.cursorPosition : testCase.input.message.length,
            );

            expect(output).toEqual(testCase.expected);
        });
    }

    // on sending within channel threshold
    const channelThresholdCases = [{
        name: 'now unspecified, last channel switch unspecified',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 0, lastChannelSwitch: 0},
        expected: {allowSending: true},
    }, {
        name: 'now specified, last channel switch unspecified',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 1541658920334, lastChannelSwitch: 0},
        expected: {allowSending: true},
    }, {
        name: 'now specified, last channel switch unspecified',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 0, lastChannelSwitch: 1541658920334},
        expected: {allowSending: true},
    }, {
        name: 'last channel switch within threshold',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 1541658920334, lastChannelSwitch: 1541658920334 - 250},
        expected: {allowSending: false, ignoreKeyPress: true},
    }, {
        name: 'last channel switch at threshold',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 1541658920334, lastChannelSwitch: 1541658920334 - 500},
        expected: {allowSending: false, ignoreKeyPress: true},
    }, {
        name: 'last channel switch outside threshold',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 1541658920334, lastChannelSwitch: 1541658920334 - 501},
        expected: {allowSending: true},
    }, {
        name: 'last channel switch well outside threshold',
        input: {event: {keyCode: 13}, message: 'message', sendMessageOnCtrlEnter: false, sendCodeBlockOnCtrlEnter: true, now: 1541658920334, lastChannelSwitch: 1541658920334 - 1500},
        expected: {allowSending: true},
    }];

    for (const testCase of channelThresholdCases) {
        it(testCase.name, () => {
            const output = PostUtils.postMessageOnKeyPress(
                testCase.input.event,
                testCase.input.message,
                testCase.input.sendMessageOnCtrlEnter,
                testCase.input.sendCodeBlockOnCtrlEnter,
                testCase.input.now,
                testCase.input.lastChannelSwitch,
                testCase.input.message.length,
            );

            expect(output).toEqual(testCase.expected);
        });
    }
});

describe('PostUtils.getOldestPostId', () => {
    test('Should not return LOAD_OLDER_MESSAGES_TRIGGER', () => {
        const postId = PostUtils.getOldestPostId(['postId1', 'postId2', PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER]);
        assert.equal(postId, 'postId2');
    });

    test('Should not return OLDER_MESSAGES_LOADER', () => {
        const postId = PostUtils.getOldestPostId(['postId1', 'postId2', PostListRowListIds.OLDER_MESSAGES_LOADER]);
        assert.equal(postId, 'postId2');
    });

    test('Should not return CHANNEL_INTRO_MESSAGE', () => {
        const postId = PostUtils.getOldestPostId(['postId1', 'postId2', PostListRowListIds.CHANNEL_INTRO_MESSAGE]);
        assert.equal(postId, 'postId2');
    });

    test('Should not return dateline', () => {
        const postId = PostUtils.getOldestPostId(['postId1', 'postId2', 'date-1558290600000']);
        assert.equal(postId, 'postId2');
    });

    test('Should not return START_OF_NEW_MESSAGES', () => {
        const postId = PostUtils.getOldestPostId(['postId1', 'postId2', PostListRowListIds.START_OF_NEW_MESSAGES]);
        assert.equal(postId, 'postId2');
    });
});

describe('PostUtils.getPreviousPostId', () => {
    test('Should skip dateline', () => {
        const postId = PostUtils.getPreviousPostId(['postId1', 'postId2', 'date-1558290600000', 'postId3'], 1);
        assert.equal(postId, 'postId3');
    });

    test('Should skip START_OF_NEW_MESSAGES', () => {
        const postId = PostUtils.getPreviousPostId(['postId1', 'postId2', PostListRowListIds.START_OF_NEW_MESSAGES, 'postId3'], 1);
        assert.equal(postId, 'postId3');
    });

    test('Should return first postId from combined system messages', () => {
        const postId = PostUtils.getPreviousPostId(['postId1', 'postId2', 'user-activity-post1_post2_post3', 'postId3'], 1);
        assert.equal(postId, 'post1');
    });
});

describe('PostUtils.getLatestPostId', () => {
    test('Should not return LOAD_OLDER_MESSAGES_TRIGGER', () => {
        const postId = PostUtils.getLatestPostId([PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER, 'postId1', 'postId2']);
        assert.equal(postId, 'postId1');
    });

    test('Should not return OLDER_MESSAGES_LOADER', () => {
        const postId = PostUtils.getLatestPostId([PostListRowListIds.OLDER_MESSAGES_LOADER, 'postId1', 'postId2']);
        assert.equal(postId, 'postId1');
    });

    test('Should not return CHANNEL_INTRO_MESSAGE', () => {
        const postId = PostUtils.getLatestPostId([PostListRowListIds.CHANNEL_INTRO_MESSAGE, 'postId1', 'postId2']);
        assert.equal(postId, 'postId1');
    });

    test('Should not return dateline', () => {
        const postId = PostUtils.getLatestPostId(['date-1558290600000', 'postId1', 'postId2']);
        assert.equal(postId, 'postId1');
    });

    test('Should not return START_OF_NEW_MESSAGES', () => {
        const postId = PostUtils.getLatestPostId([PostListRowListIds.START_OF_NEW_MESSAGES, 'postId1', 'postId2']);
        assert.equal(postId, 'postId1');
    });

    test('Should return first postId from combined system messages', () => {
        const postId = PostUtils.getLatestPostId(['user-activity-post1_post2_post3', 'postId1', 'postId2']);
        assert.equal(postId, 'post1');
    });
});

describe('PostUtils.createAriaLabelForPost', () => {
    const emojiMap = new EmojiMap(new Map());
    test('Should show username, timestamp, message, attachments, reactions, flagged and pinned', () => {
        const intl = createIntl({locale: 'en', messages: enMessages, defaultLocale: 'en'}, {});

        const testPost = {
            message: 'test_message',
            root_id: null,
            create_at: (new Date().getTime() / 1000) || 0,
            props: {
                attachments: [
                    {i: 'am attachment 1'},
                    {and: 'i am attachment 2'},
                ],
            },
            file_ids: ['test_file_id_1'],
        };
        const author = 'test_author';
        const reactions = {
            reaction1: 'reaction 1',
            reaction2: 'reaction 2',
        };
        const isFlagged = true;

        const ariaLabel = PostUtils.createAriaLabelForPost(testPost, author, isFlagged, reactions, intl, emojiMap);
        assert.ok(ariaLabel.indexOf(author));
        assert.ok(ariaLabel.indexOf(testPost.message));
        assert.ok(ariaLabel.indexOf('3 attachments'));
        assert.ok(ariaLabel.indexOf('2 reactions'));
        assert.ok(ariaLabel.indexOf('message is saved and pinned'));
    });
    test('Should show that message is a reply', () => {
        const intl = createIntl({locale: 'en', messages: enMessages, defaultLocale: 'en'}, {});

        const testPost = {
            message: 'test_message',
            root_id: 'test_id',
            create_at: (new Date().getTime() / 1000) || 0,
        };
        const author = 'test_author';
        const reactions = {};
        const isFlagged = true;

        const ariaLabel = PostUtils.createAriaLabelForPost(testPost, author, isFlagged, reactions, intl, emojiMap);
        assert.ok(ariaLabel.indexOf('reply'));
    });
    test('Should translate emoji into {emoji-name} emoji', () => {
        const intl = createIntl({locale: 'en', messages: enMessages, defaultLocale: 'en'}, {});

        const testPost = {
            message: 'emoji_test :smile: :+1: :non-potable_water: :space emoji: :not_an_emoji:',
            create_at: (new Date().getTime() / 1000) || 0,
        };
        const author = 'test_author';
        const reactions = {};
        const isFlagged = true;

        const ariaLabel = PostUtils.createAriaLabelForPost(testPost, author, isFlagged, reactions, intl, emojiMap);
        assert.ok(ariaLabel.indexOf('smile emoji'));
        assert.ok(ariaLabel.indexOf('+1 emoji'));
        assert.ok(ariaLabel.indexOf('non-potable water emoji'));
        assert.ok(ariaLabel.indexOf(':space emoji:'));
        assert.ok(ariaLabel.indexOf(':not_an_emoji:'));
    });
    test('Generating aria label should not break if message is undefined', () => {
        const intl = createIntl({locale: 'en', messages: enMessages, defaultLocale: 'en'}, {});

        const testPost = {
            id: 32,
            message: undefined,
            create_at: (new Date().getTime() / 1000) || 0,
        };
        const author = 'test_author';
        const reactions = {};
        const isFlagged = true;

        assert.doesNotThrow(() => PostUtils.createAriaLabelForPost(testPost, author, isFlagged, reactions, intl, emojiMap));
    });
});

describe('PostUtils.splitMessageBasedOnCaretPosition', () => {
    const state = {
        caretPosition: 2,
    };

    const message = 'Test Message';
    it('should return an object with two strings when given context and message', () => {
        const stringPieces = PostUtils.splitMessageBasedOnCaretPosition(state.caretPosition, message);
        assert.equal('Te', stringPieces.firstPiece);
        assert.equal('st Message', stringPieces.lastPiece);
    });
});

describe('makeGetReplyCount', () => {
    test('should return the number of comments when called on a root post', () => {
        const getReplyCount = PostUtils.makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                        post2: {id: 'post2', root_id: 'post1'},
                        post3: {id: 'post3', root_id: 'post1'},
                    },
                    postsInThread: {
                        post1: ['post2', 'post3'],
                    },
                },
            },
        };
        const post = state.entities.posts.posts.post1;

        expect(getReplyCount(state, post)).toBe(2);
    });

    test('should return the number of comments when called on a comment', () => {
        const getReplyCount = PostUtils.makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                        post2: {id: 'post2', root_id: 'post1'},
                        post3: {id: 'post3', root_id: 'post1'},
                    },
                    postsInThread: {
                        post1: ['post2', 'post3'],
                    },
                },
            },
        };
        const post = state.entities.posts.posts.post3;

        expect(getReplyCount(state, post)).toBe(2);
    });

    test('should return 0 when called on a post without comments', () => {
        const getReplyCount = PostUtils.makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                    },
                    postsInThread: {},
                },
            },
        };
        const post = state.entities.posts.posts.post1;

        expect(getReplyCount(state, post)).toBe(0);
    });

    test('should not count ephemeral comments', () => {
        const getReplyCount = PostUtils.makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                        post2: {id: 'post2', root_id: 'post1', type: Posts.POST_TYPES.EPHEMERAL},
                        post3: {id: 'post3', root_id: 'post1'},
                    },
                    postsInThread: {
                        post1: ['post2', 'post3'],
                    },
                },
            },
        };
        const post = state.entities.posts.posts.post1;

        expect(getReplyCount(state, post)).toBe(1);
    });
});
