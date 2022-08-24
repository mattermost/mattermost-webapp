// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from '@mattermost/types/users';

import {channel, boardComponent, directChannel, user1} from './utils';

import DMIntroMessage from './dm';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
    };

    describe('test DIRECT Channel', () => {
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match snapshot, without teammate', () => {
            const wrapper = shallow(
                <DMIntroMessage
                    {...props}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with teammate, without boards', () => {
            const wrapper = shallow(
                <DMIntroMessage
                    {...props}
                    teammate={user1 as UserProfile}
                    teammateName='my teammate'
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with teammate, with boards', () => {
            const wrapper = shallow(
                <DMIntroMessage
                    {...props}
                    teammate={user1 as UserProfile}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
