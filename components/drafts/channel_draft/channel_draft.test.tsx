// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Provider} from 'react-redux';

import mockStore from 'tests/test_store';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile, UserStatus} from '@mattermost/types/users';
import {PostDraft} from 'types/store/draft';

import ChannelDraft from './channel_draft';

describe('components/drafts/drafts_row', () => {
    const baseProps = {
        channel: {
            id: '',
        } as Channel,
        channelUrl: '',
        displayName: '',
        draftId: '',
        id: {} as Channel['id'],
        status: {} as UserStatus['status'],
        type: 'channel' as 'channel' | 'thread',
        user: {} as UserProfile,
        value: {} as PostDraft,
    };

    it('should match snapshot for channel draft', () => {
        const store = mockStore();

        const wrapper = shallow(
            <Provider store={store}>
                <ChannelDraft
                    {...baseProps}
                />
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for undefined channel', () => {
        const store = mockStore();

        const props = {
            ...baseProps,
            channel: null as unknown as Channel,
        };

        const wrapper = shallow(
            <Provider store={store}>
                <ChannelDraft
                    {...props}
                />
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
