// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InstalledOutgoingWebhooks from 'components/integrations/installed_outgoing_webhooks/installed_outgoing_webhooks.jsx';

describe('components/integrations/InstalledOutgoingWebhooks', () => {
    let outgoingWebhooks = {};
    let mockFunc;
    const loadOutgoingHooksAndProfilesForTeam = () => new Promise((resolve) => resolve());
    const teamId = 'testteamid';
    beforeEach(() => {
        mockFunc = jest.fn();
        outgoingWebhooks = [
            {
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
                update_at: 1508329149618,
            },
            {
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
                update_at: 1508329149618,
            },
        ];
    });

    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow(
            <InstalledOutgoingWebhooks
                key={1}
                outgoingWebhooks={outgoingWebhooks}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test',
                }}
                channels={{
                    mdpzfpfcxi85zkkqkzkch4b85h: {
                        id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                        name: 'town-square',
                        display_name: 'town-square',
                    },
                }}
                teamId={teamId}
                actions={{
                    removeOutgoingHook: emptyFunction,
                    loadOutgoingHooksAndProfilesForTeam,
                    regenOutgoingHookToken: emptyFunction,
                }}
                user={{
                    first_name: 'sudheer',
                    id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    roles: 'system_admin system_user',
                    username: 'sudheerdev',
                }}
                users={{
                    zaktnt8bpbgu8mb6ez9k64r7sa: {
                        first_name: 'sudheer',
                        id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                        roles: 'system_admin system_user',
                        username: 'sudheerdev',
                    },
                }}
                enableOutgoingWebhooks={true}
            />,
        );
        expect(shallow(<div>{wrapper.instance().outgoingWebhooks('town')}</div>)).toMatchSnapshot();
        expect(shallow(<div>{wrapper.instance().outgoingWebhooks('ZZZ')}</div>)).toMatchSnapshot();
        expect(wrapper).toMatchSnapshot();
    });

    test('should call regenOutgoingHookToken function', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhooks
                key={1}
                outgoingWebhooks={outgoingWebhooks}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test',
                }}
                channels={{
                    mdpzfpfcxi85zkkqkzkch4b85h: {
                        id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                        name: 'town-square',
                        display_name: 'town-square',
                    },
                }}
                teamId={teamId}
                actions={{
                    removeOutgoingHook: emptyFunction,
                    loadOutgoingHooksAndProfilesForTeam,
                    regenOutgoingHookToken: mockFunc,
                }}
                user={{
                    first_name: 'sudheer',
                    id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    roles: 'system_admin system_user',
                    username: 'sudheerdev',
                }}
                users={{
                    zaktnt8bpbgu8mb6ez9k64r7sa: {
                        first_name: 'sudheer',
                        id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                        roles: 'system_admin system_user',
                        username: 'sudheerdev',
                    },
                }}
                enableOutgoingWebhooks={true}
            />,
        );
        wrapper.instance().regenOutgoingWebhookToken(outgoingWebhooks[0]);
        expect(mockFunc).toHaveBeenCalledTimes(1);
        expect(mockFunc).toHaveBeenCalledWith(outgoingWebhooks[0].id);
    });

    test('should call removeOutgoingHook function', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhooks
                key={1}
                outgoingWebhooks={outgoingWebhooks}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test',
                }}
                channels={{
                    mdpzfpfcxi85zkkqkzkch4b85h: {
                        id: 'mdpzfpfcxi85zkkqkzkch4b85h',
                        name: 'town-square',
                        display_name: 'town-square',
                    },
                }}
                teamId={teamId}
                actions={{
                    removeOutgoingHook: mockFunc,
                    loadOutgoingHooksAndProfilesForTeam,
                    regenOutgoingHookToken: emptyFunction,
                }}
                user={{
                    first_name: 'sudheer',
                    id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                    roles: 'system_admin system_user',
                    username: 'sudheerdev',
                }}
                users={{
                    zaktnt8bpbgu8mb6ez9k64r7sa: {
                        first_name: 'sudheer',
                        id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
                        roles: 'system_admin system_user',
                        username: 'sudheerdev',
                    },
                }}
                enableOutgoingWebhooks={true}
            />,
        );

        wrapper.instance().removeOutgoingHook(outgoingWebhooks[1]);
        expect(mockFunc).toHaveBeenCalledTimes(1);
        expect(mockFunc).toHaveBeenCalledWith(outgoingWebhooks[1].id);
        expect(mockFunc).toHaveBeenCalled();
    });
});
