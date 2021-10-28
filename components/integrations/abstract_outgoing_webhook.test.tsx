// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AbstractOutgoingWebhook from 'components/integrations/abstract_outgoing_webhook';
import {OutgoingWebhook} from 'mattermost-redux/types/integrations';
import {Team} from 'packages/mattermost-redux/src/types/teams';
import {generateId} from 'mattermost-redux/utils/helpers';
import {TestHelper} from '../../utils/test_helper';

describe('components/integrations/AbstractOutgoingWebhook', () => {
    const emptyFunction = jest.fn();
    const team: Team = TestHelper.getTeamMock();
    const initialHook: OutgoingWebhook = {
        id: generateId(),
        token: generateId(),
        create_at: 1507841118796,
        update_at: 1507841118796,
        delete_at: 0,
        creator_id: 'cd462387-9325-417e-9df2-06e9f0a5e7f6',
        channel_id: 'cd462387-9325-417e-9df2-06e9f0a5e7f6',
        team_id: team.id,
        trigger_words: ['testword'],
        trigger_when: 0,
        callback_urls: ['http://localhost/notarealendpoint'],
        display_name: 'test',
        description: '',
        content_type: 'application/x-www-form-urlencoded',
        username: 'user_name',
        icon_url: '',
    };

    const props = {
        team,
        action: emptyFunction,
        enablePostUsernameOverride: false,
        enablePostIconOverride: false,
        header: {id: 'add', defaultMessage: 'add'},
        footer: {id: 'save', defaultMessage: 'save'},
        loading: {id: 'loading', defaultMessage: 'loading'},
        renderExtra: '',
        serverError: '',
        initialHook,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<AbstractOutgoingWebhook {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should render username in case of enablePostUsernameOverride is true ', () => {
        const usernameTrueProps = {...props, enablePostUsernameOverride: true};
        const wrapper = shallow(<AbstractOutgoingWebhook {...usernameTrueProps}/>);
        expect(wrapper.find('#username')).toHaveLength(1);
    });

    test('should render username in case of enablePostUsernameOverride is true ', () => {
        const iconUrlTrueProps = {...props, enablePostIconOverride: true};
        const wrapper = shallow(<AbstractOutgoingWebhook {...iconUrlTrueProps}/>);
        expect(wrapper.find('#iconURL')).toHaveLength(1);
    });
});
