// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InstalledOAuthApps from 'components/integrations/installed_oauth_apps/installed_oauth_apps.jsx';
import BackstageList from 'components/backstage/components/backstage_list.jsx';

describe('components/integrations/InstalledOAuthApps', () => {
    const oauthApps = {
        facxd9wpzpbpfp8pad78xj75pr: {
            id: 'facxd9wpzpbpfp8pad78xj75pr',
            name: 'firstApp',
            client_secret: '88cxd9wpzpbpfp8pad78xj75pr',
            create_at: 1501365458934,
            creator_id: '88oybd1dwfdoxpkpw1h5kpbyco',
            description: 'testing',
            homepage: 'https://test.com',
            icon_url: 'https://test.com/icon',
            is_trusted: false,
            update_at: 1501365458934,
            callback_urls: ['https://test.com/callback'],
        },
        fzcxd9wpzpbpfp8pad78xj75pr: {
            id: 'fzcxd9wpzpbpfp8pad78xj75pr',
            name: 'secondApp',
            client_secret: 'decxd9wpzpbpfp8pad78xj75pr',
            create_at: 1501365459984,
            creator_id: '88oybd2dwfdoxpkpw1h5kpbyco',
            description: 'testing2',
            homepage: 'https://test2.com',
            icon_url: 'https://test2.com/icon',
            is_trusted: true,
            update_at: 1501365479988,
            callback_urls: ['https://test2.com/callback', 'https://test2.com/callback2'],
        },
    };

    const baseProps = {
        team: {name: 'test'},
        oauthApps,
        canManageOauth: true,
        regenOAuthAppSecretRequest: {
            status: 'not_started',
            error: null,
        },
        actions: {
            getOAuthApps: jest.fn(),
            regenOAuthAppSecret: jest.fn(),
            deleteOAuthApp: jest.fn(),
        },
        enableOAuthServiceProvider: true,
        enableOnlyAdminIntegrations: true,
    };

    test('should match snapshot', () => {
        const newGetOAuthApps = jest.genMockFunction().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );

        const props = {...baseProps};
        props.actions.getOAuthApps = newGetOAuthApps;
        const wrapper = shallow(
            <InstalledOAuthApps {...props}/>
        );
        expect(wrapper.find('InstalledOAuthApp').length).toBe(2);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(BackstageList).props().addLink).toEqual('/test/integrations/oauth2-apps/add');
        expect(wrapper.find(BackstageList).props().addText).toEqual('Add OAuth 2.0 Application');

        wrapper.setProps({canManageOauth: false});
        expect(wrapper.find(BackstageList).props().addLink).toBeFalsy();
        expect(wrapper.find(BackstageList).props().addText).toBeFalsy();
    });

    test('should props.deleteOAuthApp on deleteOAuthApp', () => {
        const newDeleteOAuthApp = jest.fn();
        const props = {...baseProps};
        props.actions.deleteOAuthApp = newDeleteOAuthApp;
        const wrapper = shallow(
            <InstalledOAuthApps {...props}/>
        );

        wrapper.instance().deleteOAuthApp(oauthApps.facxd9wpzpbpfp8pad78xj75pr);
        expect(newDeleteOAuthApp).toHaveBeenCalled();
        expect(newDeleteOAuthApp).toHaveBeenCalledWith(oauthApps.facxd9wpzpbpfp8pad78xj75pr.id);
    });
});
