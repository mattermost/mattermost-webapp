// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InstalledOutgoingWebhooks from 'components/integrations/components/installed_outgoing_webhooks/installed_outgoing_webhooks.jsx';
import InstalledOutgoingWebhook from 'components/integrations/components/installed_outgoing_webhook.jsx';

describe('components/integrations/InstalledOutgoingWebhooks', () => {
    let outgoingWebhooks = {};
    let mockFunc;
    const teamId = 'testteamid';
    beforeEach(() => {
        mockFunc = jest.fn();
        outgoingWebhooks = {
            '7h88x419ubbyuxzs7dfwtgkffr': {
                callback_urls: ['http://adsfdasd.com'],
                channel_id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                content_type: 'application/x-www-form-urlencoded',
                create_at: 1508327769020,
                creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                delete_at: 0,
                description: 'build status',
                display_name: '',
                id: '7h88x419ubbyuxzs7dfwtgkfgr',
                team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
                token: 'xoxz1z7c3tgi9xhrfudn638q9r',
                trigger_when: 0,
                trigger_words: ['build'],
                0: 'asdf',
                update_at: 1508329149618
            },
            '7h88x419ubbyuxzs7dfwtgkfff': {
                callback_urls: ['http://adsfdasd.com'],
                channel_id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                content_type: 'application/x-www-form-urlencoded',
                create_at: 1508327769020,
                creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                delete_at: 0,
                description: 'test',
                display_name: '',
                id: '7h88x419ubbyuxzs7dfwtgkffr',
                team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
                token: 'xoxz1z7c3tgi9xhrfudn638q9r',
                trigger_when: 0,
                trigger_words: ['test'],
                0: 'asdf',
                update_at: 1508329149618
            }
        };
    });

    test('should match snapshot', () => {
        global.window.mm_config = {EnableOutgoingWebhooks: true};
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhooks
                key={1}
                outgoingWebhooks={outgoingWebhooks}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channels={{
                    mdpzfpfcxi85zkkqkzkch4b85h: {
                        id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                        name: 'town-square',
                        display_name: 'town-square'
                    }
                }}
                teamId={teamId}
                actions={{
                    removeOutgoingHook: emptyFunction,
                    getOutgoingHooks: emptyFunction,
                    regenOutgoingHookToken: emptyFunction
                }}
                user={{
                    first_name: 'sudheer',
                    id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    roles: 'system_admin system_user',
                    username: 'sudheerdev'
                }}
                users={{
                    zaktnt8bpbgu8mb6ez9k64r7sa: {
                        first_name: 'sudheer',
                        id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                        roles: 'system_admin system_user',
                        username: 'sudheerdev'
                    }
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call regenOutgoingHookToken function', () => {
        global.window.mm_config = {EnableOutgoingWebhooks: true};
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhooks
                key={1}
                outgoingWebhooks={outgoingWebhooks}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channels={{
                    mdpzfpfcxi85zkkqkzkch4b85h: {
                        id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                        name: 'town-square',
                        display_name: 'town-square'
                    }
                }}
                teamId={teamId}
                actions={{
                    removeOutgoingHook: emptyFunction,
                    getOutgoingHooks: emptyFunction,
                    regenOutgoingHookToken: mockFunc
                }}
                user={{
                    first_name: 'sudheer',
                    id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    roles: 'system_admin system_user',
                    username: 'sudheerdev'
                }}
                users={{
                    zaktnt8bpbgu8mb6ez9k64r7sa: {
                        first_name: 'sudheer',
                        id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                        roles: 'system_admin system_user',
                        username: 'sudheerdev'
                    }
                }}
            />
        );
        wrapper.find(InstalledOutgoingWebhook).first().prop('onRegenToken')(outgoingWebhooks['7h88x419ubbyuxzs7dfwtgkffr']);
        expect(mockFunc).toHaveBeenCalled();
    });

    test('should call removeOutgoingHook function', () => {
        global.window.mm_config = {EnableOutgoingWebhooks: true};
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhooks
                key={1}
                outgoingWebhooks={outgoingWebhooks}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channels={{
                    mdpzfpfcxi85zkkqkzkch4b85h: {
                        id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                        name: 'town-square',
                        display_name: 'town-square'
                    }
                }}
                teamId={teamId}
                actions={{
                    removeOutgoingHook: mockFunc,
                    getOutgoingHooks: emptyFunction,
                    regenOutgoingHookToken: emptyFunction
                }}
                user={{
                    first_name: 'sudheer',
                    id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    roles: 'system_admin system_user',
                    username: 'sudheerdev'
                }}
                users={{
                    zaktnt8bpbgu8mb6ez9k64r7sa: {
                        first_name: 'sudheer',
                        id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                        roles: 'system_admin system_user',
                        username: 'sudheerdev'
                    }
                }}
            />
        );
        wrapper.find(InstalledOutgoingWebhook).first().prop('onDelete')(outgoingWebhooks['7h88x419ubbyuxzs7dfwtgkfff']);
        expect(mockFunc).toHaveBeenCalled();
    });
});
