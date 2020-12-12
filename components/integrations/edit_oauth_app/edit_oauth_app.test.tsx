// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {OAuthApp} from 'mattermost-redux/types/integrations';

import {Team} from 'mattermost-redux/types/teams';

import {browserHistory} from 'utils/browser_history';

import EditOAuthApp from 'components/integrations/edit_oauth_app/edit_oauth_app';

describe('components/integrations/EditOAuthApp', () => {
    const oauthApp: OAuthApp = {
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
    const team: Team = {
        id: 'dbcxd9wpzpbpfp8pad78xj12pr',
        name: 'test',
        create_at: 1501365458934,
        update_at: 1501365458934,
        delete_at: 1501365458934,
        display_name: 'display',
        description: 'desc',
        email: 'email',
        type: 'I',
        company_name: 'company',
        allowed_domains: 'allowed_domains',
        invite_id: 'invite_id',
        allow_open_invite: true,
        scheme_id: 'scheme_id',
        group_constrained: true,
    };
    const editOAuthAppRequest = {
        status: 'not_started',
        error: null,
    };

    const baseProps = {
        team,
        oauthAppId: oauthApp.id,
        editOAuthAppRequest,
        actions: {
            getOAuthApp: jest.fn(),
            editOAuthApp: jest.fn(),
        },
        enableOAuthServiceProvider: true,
    };

    test('should match snapshot, loading', () => {
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot', () => {
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(props.actions.getOAuthApp).toHaveBeenCalledWith(oauthApp.id);
    });

    test('should match snapshot when EnableOAuthServiceProvider is false', () => {
        const props = {...baseProps, oauthApp, enableOAuthServiceProvider: false};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(props.actions.getOAuthApp).not.toHaveBeenCalledWith();
    });

    test('should have match state when handleConfirmModal is called', () => {
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        wrapper.setState({showConfirmModal: false});
        (wrapper.instance() as EditOAuthApp).handleConfirmModal();
        expect(wrapper.state('showConfirmModal')).toEqual(true);
    });

    test('should have match state when confirmModalDismissed is called', () => {
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        wrapper.setState({showConfirmModal: true});
        (wrapper.instance() as EditOAuthApp).confirmModalDismissed();
        expect(wrapper.state('showConfirmModal')).toEqual(false);
    });

    test('should have match renderExtra', () => {
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        expect((wrapper.instance() as EditOAuthApp).renderExtra()).toMatchSnapshot();
    });

    test('should have match when editOAuthApp is called', () => {
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        const instance = wrapper.instance() as EditOAuthApp;
        instance.handleConfirmModal = jest.fn();
        instance.submitOAuthApp = jest.fn();
        (wrapper.instance() as EditOAuthApp).editOAuthApp(oauthApp);

        expect(instance.handleConfirmModal).not.toBeCalled();
        expect(instance.submitOAuthApp).toBeCalled();
    });

    test('should have match when submitOAuthApp is called on success', async () => {
        baseProps.actions.editOAuthApp = jest.fn().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve({
                        data: 'data',
                        error: null,
                    }));
                });
            },
        );

        browserHistory.push = jest.fn();
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        const instance = wrapper.instance() as EditOAuthApp;
        wrapper.setState({showConfirmModal: true});
        await instance.submitOAuthApp();

        expect(wrapper.state('serverError')).toEqual('');
        expect(browserHistory.push).toHaveBeenCalledWith(`/${team.name}/integrations/oauth2-apps`);
    });

    test('should have match when submitOAuthApp is called on error', async () => {
        baseProps.actions.editOAuthApp = jest.fn().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve({
                        data: null,
                        error: {message: 'error message'},
                    }));
                });
            },
        );
        const props = {...baseProps, oauthApp};
        const wrapper = shallow(
            <EditOAuthApp {...props}/>,
        );

        const instance = wrapper.instance() as EditOAuthApp;
        wrapper.setState({showConfirmModal: true});
        await instance.submitOAuthApp();

        expect(wrapper.state('showConfirmModal')).toEqual(false);
        expect(wrapper.state('serverError')).toEqual('error message');
    });
});
