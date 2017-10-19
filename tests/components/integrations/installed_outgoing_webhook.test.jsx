// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Link} from 'react-router';

import DeleteIntegration from 'components/integrations/components/delete_integration.jsx';
import InstalledOutgoingWebhook from 'components/integrations/components/installed_outgoing_webhook.jsx';

describe('components/integrations/InstalledOutgoingWebhook', () => {
    let outgoingWebhook = {};
    let mockFunc;
    const teamId = 'testteamid';
    beforeEach(() => {
        mockFunc = jest.fn();
        outgoingWebhook = {
            callback_urls: ['http://adsfdasd.com'],
            channel_id: 'mdpzfpfcxi85zkkqkzkch4b85h',
            content_type: 'application/x-www-form-urlencoded',
            create_at: 1508327769020,
            creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
            delete_at: 0,
            description: 'build status',
            display_name: 'build',
            id: '7h88x419ubbyuxzs7dfwtgkffr',
            team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
            token: 'xoxz1z7c3tgi9xhrfudn638q9r',
            trigger_when: 0,
            trigger_words: ['build'],
            0: 'asdf',
            update_at: 1508329149618
        };
    });

    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should not have edit and delete actions if user does not have permissions to change', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                canChange={false}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        expect(wrapper.find('.item-actions').length).toBe(0);
    });

    test('should have edit and delete actions if user can change webhook', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        expect(wrapper.find('.item-actions').find(Link).exists()).toBe(true);
        expect(wrapper.find('.item-actions').find(DeleteIntegration).exists()).toBe(true);
    });

    test('Should have the same name and description on view as it has in outgoingWebhook', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                canChange={false}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );

        expect(wrapper.find('.item-details__description').text()).toBe('build status');
        expect(wrapper.find('.item-details__name').text()).toBe('build');
    });

    test('Should not display description as it is null', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        outgoingWebhook.description = null;
        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                canChange={false}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        expect(wrapper.find('.item-details__description').length).toBe(0);
    });

    test('Should not render any nodes as there are no filtered results', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                filter={'someLongText'}
                canChange={false}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        expect(wrapper.getElement()).toBe(null);
    });

    test('Should render a webhook item as filtered result is true', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={emptyFunction}
                creator={{}}
                filter={'buil'}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        expect(wrapper.find('.item-details').exists()).toBe(true);
    });

    test('Should call onRegenToken function once', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={emptyFunction}
                onRegenToken={mockFunc}
                creator={{}}
                filter={'buil'}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        wrapper.find('.item-actions a').first().simulate('click', {preventDefault() {
            return jest.fn();
        }});
        expect(mockFunc).toHaveBeenCalledTimes(1);
    });

    test('Should call onDelete function once', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow(
            <InstalledOutgoingWebhook
                key={1}
                outgoingWebhook={outgoingWebhook}
                onDelete={mockFunc}
                onRegenToken={emptyFunction}
                creator={{}}
                filter={'buil'}
                canChange={true}
                team={{
                    id: teamId,
                    name: 'test'
                }}
                channel={{
                    id: '1jiw9kphbjrntfyrm7xpdcya4o',
                    name: 'town-square'
                }}
            />
        );
        wrapper.find(DeleteIntegration).first().prop('onDelete')();
        expect(mockFunc).toHaveBeenCalledTimes(1);
    });
});
