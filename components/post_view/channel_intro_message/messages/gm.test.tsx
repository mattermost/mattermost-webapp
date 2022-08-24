// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {boardComponent, channel, groupChannel, users} from './utils';

import GMIntroMessage from './gm';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        currentUserId: 'test-user-id',
        channel,
        profiles: [],
    };

    describe('test Group Channel', () => {
        const props = {
            ...baseProps,
            channel: groupChannel,
        };

        test('should match snapshot, no profiles', () => {
            const wrapper = shallow(
                <GMIntroMessage
                    {...props}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, without boards', () => {
            const wrapper = shallow(
                <GMIntroMessage
                    {...props}
                    profiles={users}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, with boards', () => {
            const wrapper = shallow(
                <GMIntroMessage
                    {...props}
                    profiles={users}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
