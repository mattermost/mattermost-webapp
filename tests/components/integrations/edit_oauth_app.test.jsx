// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import EditOAuthApp from 'components/integrations/components/edit_oauth_app/edit_oauth_app.jsx';

describe('components/integrations/EditOAuthApp', () => {
    const emptyFunction = jest.fn();
    const app = {
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
        callback_urls: ['https://test.com/callback', 'https://test.com/callback2']
    };
    const team = {
        id: 'dbcxd9wpzpbpfp8pad78xj12pr',
        name: 'test'
    };
    global.window.mm_config = {EnableOAuthServiceProvider: 'true'};

    test('should match snapshot', () => {
        const wrapper = shallow(
            <EditOAuthApp
                team={team}
                oauthAppId={app.id}
                oauthApp={app}
                editOAuthAppRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{
                    getOAuthApp: emptyFunction,
                    editOAuthApp: emptyFunction
                }}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loading', () => {
        const wrapper = shallow(
            <EditOAuthApp
                team={team}
                oauthAppId={app.id}
                editOAuthAppRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{
                    getOAuthApp: emptyFunction,
                    editOAuthApp: emptyFunction
                }}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
