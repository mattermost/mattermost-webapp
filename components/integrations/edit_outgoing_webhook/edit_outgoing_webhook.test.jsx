// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {browserHistory} from 'utils/browser_history';
import EditOutgoingWebhook from 'components/integrations/edit_outgoing_webhook/edit_outgoing_webhook.jsx';

describe('components/integrations/EditOutgoingWebhook', () => {
    const team = {
        id: 'team_id',
        name: 'test',
    };
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
        content_type: 'application/json',
    };
    const updateOutgoingHookRequest = {
        status: 'not_started',
        error: null,
    };
    const baseProps = {
        team,
        hookId: 'hook_id',
        updateOutgoingHookRequest,
        actions: {
            updateOutgoingHook: jest.fn(),
            getOutgoingHook: jest.fn(),
        },
        enableOutgoingWebhooks: true,
        enablePostUsernameOverride: false,
        enablePostIconOverride: false,
    };

    test('should match snapshot', () => {
        const props = {...baseProps, hook};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loading', () => {
        const wrapper = shallow(
            <EditOutgoingWebhook {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when EnableOutgoingWebhooks is false', () => {
        const props = {...baseProps, enableOutgoingWebhooks: false, hook};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have match state when handleConfirmModal is called', () => {
        const props = {...baseProps, hook};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        wrapper.setState({showConfirmModal: false});
        wrapper.instance().handleConfirmModal();
        expect(wrapper.state('showConfirmModal')).toEqual(true);
    });

    test('should have match state when confirmModalDismissed is called', () => {
        const props = {...baseProps, hook};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        wrapper.setState({showConfirmModal: true});
        wrapper.instance().confirmModalDismissed();
        expect(wrapper.state('showConfirmModal')).toEqual(false);
    });

    test('should have match renderExtra', () => {
        const props = {...baseProps, hook};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        expect(wrapper.instance().renderExtra()).toMatchSnapshot();
    });

    test('should have match when editOutgoingHook is called', () => {
        const props = {...baseProps, hook};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        const instance = wrapper.instance();
        instance.handleConfirmModal = jest.fn();
        instance.submitHook = jest.fn();
        wrapper.instance().editOutgoingHook(hook);

        expect(instance.handleConfirmModal).not.toBeCalled();
        expect(instance.submitHook).toBeCalled();
    });

    test('should have match when submitHook is called on success', async () => {
        const newActions = {...baseProps.actions, updateOutgoingHook: jest.fn().mockReturnValue({data: 'data'})};
        browserHistory.push = jest.fn();
        const props = {...baseProps, hook, actions: newActions};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        const instance = wrapper.instance();
        wrapper.setState({showConfirmModal: true});
        await instance.submitHook();

        expect(newActions.updateOutgoingHook).toHaveBeenCalledTimes(1);
        expect(wrapper.state('serverError')).toEqual('');
        expect(browserHistory.push).toHaveBeenCalledWith(`/${team.name}/integrations/outgoing_webhooks`);
    });

    test('should have match when submitHook is called on error', async () => {
        const newActions = {...baseProps.actions, updateOutgoingHook: jest.fn().mockReturnValue({data: ''})};
        const newUpdateOutgoingHookRequest = {
            status: 'error',
            error: {message: 'error'},
        };
        const props = {...baseProps, hook, updateOutgoingHookRequest: newUpdateOutgoingHookRequest, actions: newActions};
        const wrapper = shallow(
            <EditOutgoingWebhook {...props}/>
        );

        const instance = wrapper.instance();
        wrapper.setState({showConfirmModal: true});
        await instance.submitHook();

        expect(wrapper.state('serverError')).toEqual(newUpdateOutgoingHookRequest.error.message);
        expect(wrapper.state('showConfirmModal')).toEqual(false);
    });
});
