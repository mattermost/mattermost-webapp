// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AbstractIncomingWebhook from 'components/integrations/abstract_incoming_webhook';
import {Team} from 'packages/mattermost-redux/src/types/teams';
import {IncomingWebhook} from 'mattermost-redux/types/integrations';
import {TestHelper} from '../../utils/test_helper';

describe('components/integrations/AbstractIncomingWebhook', () => {
    const team : Team = TestHelper.getTeamMock();
    const header = {id: 'header_id', defaultMessage: 'Header'};
    const footer = {id: 'footer_id', defaultMessage: 'Footer'};
    const loading = {id: 'loading_id', defaultMessage: 'Loading'};
    const serverError = '';
    const initialHook : IncomingWebhook = TestHelper.getIncomingWebhookMock({
        display_name: 'testIncomingWebhook',
        channel_id: '88cxd9wpzpbpfp8pad78xj75pr',
        description: 'testing',
        id: '9w96t4nhbfdiij64wfqors4i1r',
        create_at: 1502455422406,
        delete_at: 0,
        team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
        update_at: 1502455422406,
        user_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
        username: 'username',
        icon_url: 'http://test/icon.png',
        channel_locked: false,
    });

    const enablePostUsernameOverride = true;
    const enablePostIconOverride = true;

    const action = jest.fn().mockImplementation(
        () => {
            return new Promise<void>((resolve) => {
                process.nextTick(() => resolve());
            });
        },
    );

    const requiredProps = {
        team,
        header,
        footer,
        loading,
        serverError,
        initialHook,
        enablePostUsernameOverride,
        enablePostIconOverride,
        action,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<AbstractIncomingWebhook {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on serverError', () => {
        const newServerError = 'serverError';
        const props = {...requiredProps, serverError: newServerError};
        const wrapper = shallow(<AbstractIncomingWebhook {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, displays client error when no initial hook', () => {
        const newInitialHook: IncomingWebhook = {id: '',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            user_id: '',
            channel_id: '',
            team_id: '',
            display_name: '',
            description: '',
            username: '',
            icon_url: '',
            channel_locked: false};
        const props = {...requiredProps, initialHook: newInitialHook};
        const wrapper = shallow(<AbstractIncomingWebhook {...props}/>);

        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).not.toBeCalled();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, hiding post username if not enabled', () => {
        const props = {
            ...requiredProps,
            enablePostUsernameOverride: false,
        };
        const wrapper = shallow(<AbstractIncomingWebhook {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, hiding post icon url if not enabled', () => {
        const props = {
            ...requiredProps,
            enablePostIconOverride: false,
        };
        const wrapper = shallow(<AbstractIncomingWebhook {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call action function', () => {
        const wrapper = shallow(<AbstractIncomingWebhook {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();

        wrapper.find('#displayName').simulate('change', {target: {value: 'name'}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).toBeCalled();
        expect(action).toHaveBeenCalledTimes(1);
    });

    test('should update state.channelId when on channel change', () => {
        const newChannelId = 'new_channel_id';
        const evt = {
            preventDefault: jest.fn(),
            target: {value: newChannelId},
        };

        const wrapper = shallow(<AbstractIncomingWebhook {...requiredProps}/>);
        wrapper.find('#channelId').simulate('change', evt);

        expect(wrapper.state('channelId')).toBe(newChannelId);
    });

    test('should update state.description when on description change', () => {
        const newDescription = 'new_description';
        const evt = {
            preventDefault: jest.fn(),
            target: {value: newDescription},
        };

        const wrapper = shallow(<AbstractIncomingWebhook {...requiredProps}/>);
        wrapper.find('#description').simulate('change', evt);

        expect(wrapper.state('description')).toBe(newDescription);
    });

    test('should update state.username on post username change', () => {
        const newUsername = 'new_username';
        const evt = {
            preventDefault: jest.fn(),
            target: {value: newUsername},
        };

        const wrapper = shallow(<AbstractIncomingWebhook {...requiredProps}/>);
        wrapper.find('#username').simulate('change', evt);

        expect(wrapper.state('username')).toBe(newUsername);
    });

    test('should update state.iconURL on post icon url change', () => {
        const newIconURL = 'http://example.com/icon';
        const evt = {
            preventDefault: jest.fn(),
            target: {value: newIconURL},
        };

        const wrapper = shallow(<AbstractIncomingWebhook {...requiredProps}/>);
        wrapper.find('#iconURL').simulate('change', evt);

        expect(wrapper.state('iconURL')).toBe(newIconURL);
    });
});
