// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AbstractOAuthApp from 'components/integrations/components/abstract_oauth_app.jsx';

describe('components/integrations/AbstractOAuthApp', () => {
    const emptyFunction = jest.fn();
    const header = {id: 'Header', defaultMessage: 'Header'};
    const footer = {id: 'Footer', defaultMessage: 'Footer'};
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
    const action = jest.genMockFunction().mockImplementation(
        () => {
            return new Promise((resolve) => {
                process.nextTick(() => resolve());
            });
        }
    );

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AbstractOAuthApp
                team={{name: 'test'}}
                header={header}
                footer={footer}
                renderExtra={'renderExtra'}
                serverError={'serverError'}
                initialApp={app}
                action={emptyFunction}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, displays client error', () => {
        const wrapper = shallow(
            <AbstractOAuthApp
                team={{name: 'test'}}
                header={header}
                footer={footer}
                renderExtra={'renderExtra'}
                serverError={'serverError'}
                initialApp={app}
                action={action}
            />
        );

        wrapper.find('#callbackUrls').simulate('change', {target: {value: ''}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).not.toBeCalled();
        expect(wrapper).toMatchSnapshot();
    });

    test('should call action function', () => {
        const wrapper = shallow(
            <AbstractOAuthApp
                team={{name: 'test'}}
                header={header}
                footer={footer}
                renderExtra={'renderExtra'}
                serverError={'serverError'}
                initialApp={app}
                action={action}
            />
        );

        wrapper.find('#name').simulate('change', {target: {value: 'name'}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).toBeCalled();
    });
});
