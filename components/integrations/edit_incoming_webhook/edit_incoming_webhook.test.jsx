// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {browserHistory} from 'utils/browser_history';
import EditIncomingWebhook from 'components/integrations/edit_incoming_webhook/edit_incoming_webhook.jsx';

describe('components/integrations/EditIncomingWebhook', () => {
    const hook = {
        id: 'id',
        token: 'token',
    };

    let updateIncomingHook = null;
    let getIncomingHook = null;
    let actions = {};

    const requiredProps = {
        hookId: 'somehookid',
        teamId: 'testteamid',
        team: {
            id: 'testteamid',
            name: 'test',
        },
        updateIncomingHookRequest: {
            status: 'not_started',
            error: null,
        },
        enableIncomingWebhooks: true,
        enablePostUsernameOverride: true,
        enablePostIconOverride: true,
    };

    afterEach(() => {
        updateIncomingHook = null;
        getIncomingHook = null;
        actions = {};
    });

    beforeEach(() => {
        updateIncomingHook = jest.fn();
        getIncomingHook = jest.fn();
        actions = {
            updateIncomingHook,
            getIncomingHook,
        };
    });

    test('should show Loading screen when no hook is provided', () => {
        const props = {...requiredProps, actions};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(getIncomingHook).toHaveBeenCalledTimes(1);
        expect(getIncomingHook).toBeCalledWith(props.hookId);
    });

    test('should show AbstractIncomingWebhook', () => {
        const props = {...requiredProps, actions, hook};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should not call getIncomingHook', () => {
        const props = {...requiredProps, enableIncomingWebhooks: false, actions};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(getIncomingHook).toHaveBeenCalledTimes(0);
    });

    test('should have called submitHook when editIncomingHook is initiated (no server error)', async () => {
        const newUpdateIncomingHook = jest.fn().mockReturnValue({data: ''});
        const newActions = {...actions, updateIncomingHook: newUpdateIncomingHook};
        const asyncHook = {
            id: 'id',
            token: 'token',
        };
        const props = {...requiredProps, actions: newActions, hook};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        const instance = wrapper.instance();
        await instance.editIncomingHook(asyncHook);
        expect(wrapper).toMatchSnapshot();
        expect(newActions.updateIncomingHook).toHaveBeenCalledTimes(1);
        expect(newActions.updateIncomingHook).toBeCalledWith(asyncHook);
        expect(wrapper.state('serverError')).toEqual('');
    });

    test('should have called submitHook when editIncomingHook is initiated (with server error)', async () => {
        const newUpdateIncomingHook = jest.fn().mockReturnValue({data: ''});
        const newActions = {...actions, updateIncomingHook: newUpdateIncomingHook};
        const asyncHook = {
            id: 'id',
            token: 'token',
        };
        const props = {...requiredProps, actions: newActions, hook};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        const instance = wrapper.instance();
        await instance.editIncomingHook(asyncHook);

        expect(wrapper).toMatchSnapshot();
        expect(newActions.updateIncomingHook).toHaveBeenCalledTimes(1);
        expect(newActions.updateIncomingHook).toBeCalledWith(asyncHook);
    });

    test('should have called submitHook when editIncomingHook is initiated (with data)', async () => {
        const newUpdateIncomingHook = jest.fn().mockReturnValue({data: 'data'});
        const newActions = {...actions, updateIncomingHook: newUpdateIncomingHook};
        browserHistory.push = jest.fn();
        const asyncHook = {
            id: 'id',
            token: 'token',
        };
        const props = {...requiredProps, actions: newActions, hook};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        const instance = wrapper.instance();
        await instance.editIncomingHook(asyncHook);

        expect(wrapper).toMatchSnapshot();
        expect(newUpdateIncomingHook).toHaveBeenCalledTimes(1);
        expect(newUpdateIncomingHook).toBeCalledWith(asyncHook);
        expect(wrapper.state('serverError')).toEqual('');
        expect(browserHistory.push).toHaveBeenCalledWith(`/${requiredProps.team.name}/integrations/incoming_webhooks`);
    });
});
