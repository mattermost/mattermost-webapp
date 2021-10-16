// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AddIncomingWebhook from 'components/integrations/add_incoming_webhook/add_incoming_webhook';

import {Team} from 'mattermost-redux/types/teams';
import {IncomingWebhook} from 'mattermost-redux/types/integrations';

describe('components/integrations/AddIncomingWebhook', () => {
    const createIncomingHook = jest.fn().mockResolvedValue({data: true});
    const props = {
        team: {
            id: 'testteamid',
            name: 'test',
        } as Team,
        enablePostUsernameOverride: true,
        enablePostIconOverride: true,
        actions: {createIncomingHook},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<AddIncomingWebhook {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called createIncomingHook', () => {
        const hook = {
            channel_id: 'channel_id',
            display_name: 'display_name',
            description: 'description',
            username: 'username',
            icon_url: 'icon_url',
        } as IncomingWebhook;
        const wrapper = shallow(<AddIncomingWebhook {...props}/>);
        const instance = wrapper.instance() as AddIncomingWebhook;
        instance.addIncomingHook(hook);
        expect(createIncomingHook).toHaveBeenCalledTimes(1);
        expect(createIncomingHook).toBeCalledWith(hook);
    });
});
