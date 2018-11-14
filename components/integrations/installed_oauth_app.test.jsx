// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InstalledOAuthApp from 'components/integrations/installed_oauth_app.jsx';
import DeleteIntegration from 'components/integrations/delete_integration.jsx';

describe('components/integrations/InstalledOAuthApp', () => {
    const FAKE_SECRET = '***************';
    const team = {name: 'team_name'};
    const oauthApp = {
        id: 'facxd9wpzpbpfp8pad78xj75pr',
        name: 'testApp',
        client_secret: '88cxd9wpzpbpfp8pad78xj75pr',
        create_at: 1501365458934,
        creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
        description: 'testing',
        homepage: 'https://test.com',
        icon_url: 'https://test.com/icon',
        is_trusted: true,
        update_at: 1501365458934,
        callback_urls: ['https://test.com/callback', 'https://test.com/callback2'],
    };
    const regenOAuthAppSecretRequest = {
        status: 'not_started',
        error: null,
    };

    const baseProps = {
        team,
        oauthApp,
        regenOAuthAppSecretRequest,
        onRegenerateSecret: jest.fn(),
        onDelete: jest.fn(),
        filter: '',
    };

    test('should match snapshot', () => {
        const props = {...baseProps, team};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when oauthApp is without name and not trusted', () => {
        const props = {...baseProps, team};
        props.oauthApp.name = '';
        props.oauthApp.is_trusted = false;
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on error', () => {
        const props = {...baseProps, team};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );
        wrapper.setState({error: 'error'});
        expect(wrapper).toMatchSnapshot();
    });

    test('should call onRegenerateSecret function', () => {
        const newOnRegenerateSecret = jest.fn().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );
        const props = {...baseProps, onRegenerateSecret: newOnRegenerateSecret, team};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );
        wrapper.find('#regenerateSecretButton').simulate('click', {preventDefault: jest.fn()});

        expect(newOnRegenerateSecret).toBeCalled();
        expect(newOnRegenerateSecret).toHaveBeenCalledWith(oauthApp.id);
    });

    test('should filter out OAuthApp', () => {
        const filter = 'filter';
        const props = {...baseProps, filter};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state on button clicks, both showSecretButton and hideSecretButton', () => {
        const props = {...baseProps, team};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );
        expect(wrapper.find('#showSecretButton').exists()).toBe(true);
        expect(wrapper.find('#hideSecretButton').exists()).toBe(false);

        wrapper.find('#showSecretButton').simulate('click', {preventDefault: jest.fn()});
        expect(wrapper.state('clientSecret')).toEqual(oauthApp.client_secret);
        expect(wrapper.find('#showSecretButton').exists()).toBe(false);
        expect(wrapper.find('#hideSecretButton').exists()).toBe(true);

        wrapper.find('#hideSecretButton').simulate('click', {preventDefault: jest.fn()});
        expect(wrapper.state('clientSecret')).toEqual(FAKE_SECRET);
        expect(wrapper.find('#showSecretButton').exists()).toBe(true);
        expect(wrapper.find('#hideSecretButton').exists()).toBe(false);
    });

    test('should match on handleRegenerate', () => {
        const newOnRegenerateSecret = jest.fn().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );
        const props = {...baseProps, onRegenerateSecret: newOnRegenerateSecret, team};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );

        expect(wrapper.find('#regenerateSecretButton').exists()).toBe(true);
        wrapper.find('#regenerateSecretButton').simulate('click', {preventDefault: jest.fn()});
        expect(newOnRegenerateSecret).toBeCalled();
        expect(newOnRegenerateSecret).toHaveBeenCalledWith(oauthApp.id);
    });

    test('should have called props.onDelete on handleDelete ', () => {
        const newOnDelete = jest.fn();
        const props = {...baseProps, team, onDelete: newOnDelete};
        const wrapper = shallow(
            <InstalledOAuthApp {...props}/>
        );

        expect(wrapper.find(DeleteIntegration).exists()).toBe(true);
        wrapper.find(DeleteIntegration).props().onDelete();
        expect(newOnDelete).toBeCalled();
        expect(newOnDelete).toHaveBeenCalledWith(oauthApp);
    });
});
