// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import EditIncomingWebhook from 'components/integrations/components/edit_incoming_webhook/edit_incoming_webhook.jsx';

describe('components/integrations/EditIncomingWebhook', () => {
    global.window.mm_config = {};

    const hook = {
        id: 'id',
        token: 'token'
    };

    let updateIncomingHook = null;
    let getIncomingHook = null;
    let actions = {};

    const requiredProps = {
        hookId: 'somehookid',
        teamId: 'testteamid',
        team: {
            id: 'testteamid',
            name: 'test'
        },
        updateIncomingHookRequest: {
            status: 'not_started',
            error: null
        }
    };

    afterEach(() => {
        global.window.mm_config = {};

        updateIncomingHook = null;
        getIncomingHook = null;
        actions = {};
    });

    beforeEach(() => {
        global.window.mm_config.EnableIncomingWebhooks = 'true';

        updateIncomingHook = jest.fn();
        getIncomingHook = jest.fn();
        actions = {
            updateIncomingHook,
            getIncomingHook
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
        global.window.mm_config.EnableIncomingWebhooks = 'false';

        const props = {...requiredProps, actions};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(getIncomingHook).toHaveBeenCalledTimes(0);
    });

    test('should have called submitHook when editIncomingHook is initiated (no server error)', () => {
        const asyncHook = {
            id: 'id',
            token: 'token'
        };
        const props = {...requiredProps, actions, hook};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        wrapper.instance().editIncomingHook(asyncHook);
        expect(wrapper).toMatchSnapshot();
        expect(updateIncomingHook).toHaveBeenCalledTimes(1);
        expect(updateIncomingHook).toBeCalledWith(asyncHook);
    });

    test('should have called submitHook when editIncomingHook is initiated (with server error)', () => {
        const asyncHook = {
            id: 'id',
            token: 'token'
        };
        const updateIncomingHookRequest = {
            status: 'error',
            error: {message: 'error message'}
        };
        const props = {...requiredProps, actions, hook, updateIncomingHookRequest};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        wrapper.instance().editIncomingHook(asyncHook);
        expect(wrapper).toMatchSnapshot();
        expect(updateIncomingHook).toHaveBeenCalledTimes(1);
        expect(updateIncomingHook).toBeCalledWith(asyncHook);
    });

    test('should have called submitHook when editIncomingHook is initiated (with data)', () => {
        const newUpdateIncomingHook = jest.fn(() => 'data');
        const newActions = {...actions, updateIncomingHook: newUpdateIncomingHook};
        const asyncHook = {
            id: 'id',
            token: 'token'
        };
        const props = {...requiredProps, actions: newActions, hook};
        const wrapper = shallow(<EditIncomingWebhook {...props}/>);

        wrapper.instance().editIncomingHook(asyncHook);
        expect(wrapper).toMatchSnapshot();
        expect(newUpdateIncomingHook).toHaveBeenCalledTimes(1);
        expect(newUpdateIncomingHook).toBeCalledWith(asyncHook);
    });
});
