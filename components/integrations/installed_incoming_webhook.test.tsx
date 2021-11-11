// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import {shallow} from 'enzyme';

import {IncomingWebhook} from 'mattermost-redux/types/integrations';

import InstalledIncomingWebhook from 'components/integrations/installed_incoming_webhook';
import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';
import {TestHelper} from '../../utils/test_helper';

import DeleteIntegrationLink from './delete_integration_link/delete_integration_link';

describe('components/integrations/InstalledIncomingWebhook', () => {
    const incomingWebhook: IncomingWebhook = TestHelper.getIncomingWebhookMock({
        id: '9w96t4nhbfdiij64wfqors4i1r',
        channel_id: '1jiw9kphbjrntfyrm7xpdcya4o',
        create_at: 1502455422406,
        delete_at: 0,
        description: 'build status',
        display_name: 'build',
        team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
        update_at: 1502455422406,
        user_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
        username: 'username',
        icon_url: 'http://test/icon.png',
        channel_locked: false,
    });

    const channel: Channel = TestHelper.getChannelMock();
    const team: Team = TestHelper.getTeamMock();
    const creator: UserProfile = TestHelper.getUserMock();

    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={incomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                canChange={true}
                team={team}
                channel={channel}
                filter=''
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should not have edit and delete actions if user does not have permissions to change', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={incomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                canChange={false}
                team={team}
                channel={channel}
                filter=''
            />,
        );
        expect(wrapper.find('.item-actions').length).toBe(0);
    });

    test('should have edit and delete actions if user can change webhook', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={incomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                canChange={true}
                team={team}
                channel={channel}
                filter=''
            />,
        );
        expect(wrapper.find('.item-actions').find(Link).exists()).toBe(true);
        expect(wrapper.find('.item-actions').find(DeleteIntegrationLink).exists()).toBe(true);
    });

    test('Should have the same name and description on view as it has in incomingWebhook', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={incomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                canChange={false}
                team={team}
                channel={channel}
                filter=''
            />,
        );

        expect(wrapper.find('.item-details__description').text()).toBe('build status');
        expect(wrapper.find('.item-details__name').text()).toBe('build');
    });

    test('Should not display description as it is null', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const newIncomingWebhook: IncomingWebhook = {...incomingWebhook, description: ''};
        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={newIncomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                canChange={false}
                team={team}
                channel={channel}
                filter=''
            />,
        );
        expect(wrapper.find('.item-details__description').length).toBe(0);
    });

    test('Should not render any nodes as there are no filtered results', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={incomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                filter={'someLongText'}
                canChange={false}
                team={team}
                channel={channel}
            />,
        );
        expect(wrapper.getElement()).toBe(null);
    });

    test('Should render a webhook item as filtered result is true', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const wrapper = shallow<InstalledIncomingWebhook>(
            <InstalledIncomingWebhook
                key={1}
                incomingWebhook={incomingWebhook}
                onDelete={emptyFunction}
                creator={creator}
                filter={'buil'}
                canChange={true}
                team={team}
                channel={channel}
            />,
        );
        expect(wrapper.find('.item-details').exists()).toBe(true);
    });
});
