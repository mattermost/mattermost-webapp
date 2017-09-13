// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AbstractIncomingWebhook from 'components/integrations/components/abstract_incoming_webhook.jsx';

describe('components/integrations/AbstractIncomingWebhook', () => {
    const emptyFunction = jest.fn();
    const header = {id: 'Header', defaultMessage: 'Header'};
    const footer = {id: 'Footer', defaultMessage: 'Footer'};
    const initialHook = {
        id: 'facxd9wpzpbpfp8pad78xj75pr',
        display_name: 'testIncomingWebhook',
        channel_id: '88cxd9wpzpbpfp8pad78xj75pr',
        create_at: 1501365458934,
        delete_at: 0,
        user_id: '88oybd1dwfdoxpkpw1h5kpbyco',
        team_id: '50oybd1dwfdoxpkpw1h5kpbyco',
        description: 'testing',
        update_at: 1501365458934
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
            <AbstractIncomingWebhook
                team={{name: 'test'}}
                header={header}
                footer={footer}
                serverError={'serverError'}
                initialHook={initialHook}
                action={emptyFunction}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, displays client error', () => {
        const wrapper = shallow(
            <AbstractIncomingWebhook
                team={{name: 'test'}}
                header={header}
                footer={footer}
                serverError={''}
                initialHook={{}}
                action={action}
            />
        );

        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).not.toBeCalled();
        expect(wrapper).toMatchSnapshot();
    });

    test('should call action function', () => {
        const wrapper = shallow(
            <AbstractIncomingWebhook
                team={{name: 'test'}}
                header={header}
                footer={footer}
                serverError={'serverError'}
                initialHook={initialHook}
                action={action}
            />
        );

        wrapper.find('#displayName').simulate('change', {target: {value: 'name'}});
        wrapper.find('.btn-primary').simulate('click', {preventDefault() {
            return jest.fn();
        }});

        expect(action).toBeCalled();
    });
});
