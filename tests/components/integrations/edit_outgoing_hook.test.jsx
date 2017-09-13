// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import EditOutgoingWebhook from 'components/integrations/components/edit_outgoing_webhook/edit_outgoing_webhook.jsx';

describe('components/integrations/EditOutgoingWebhook', () => {
    const emptyFunction = jest.fn();
    const teamId = 'testteamid';

    test('should match snapshot', () => {
        const hook = {
            id: 'ne8miib4dtde5jmgwqsoiwxpiy',
            token: 'nbxtx9hkhb8a5q83gw57jzi9cc',
            create_at: 1504447824673,
            update_at: 1504447824673,
            delete_at: 0,
            creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
            channel_id: 'r18hw9hgq3gtiymtpb6epf8qtr',
            team_id: 'm5gix3oye3du8ghk4ko6h9cq7y',
            trigger_words: ['trigger', 'trigger2'],
            trigger_when: 0,
            callback_urls: ['https://test.com/callback', 'https://test.com/callback2'],
            display_name: 'name',
            description: 'description',
            content_type: 'application/json'
        };

        const wrapper = shallow(
            <EditOutgoingWebhook
                team={{
                    id: teamId,
                    name: 'test'
                }}
                hook={hook}
                hookId={hook.id}
                updateOutgoingHookRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{
                    updateOutgoingHook: emptyFunction,
                    getOutgoingHook: emptyFunction
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loading', () => {
        const wrapper = shallow(
            <EditOutgoingWebhook
                team={{
                    id: teamId,
                    name: 'test'
                }}
                hookId={'somehookid'}
                updateOutgoingHookRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{
                    updateOutgoingHook: emptyFunction,
                    getOutgoingHook: emptyFunction
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
