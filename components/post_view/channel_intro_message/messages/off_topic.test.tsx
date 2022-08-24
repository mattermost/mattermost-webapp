// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {channel, boardComponent, offTopicChannel} from './utils';

import OffTopicIntroMessage from './off_topic';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
        stats: {},
        usersLimit: 10,
    };

    describe('test OFFTOPIC Channel', () => {
        const props = {
            ...baseProps,
            channel: offTopicChannel,
        };

        test('should match snapshot, without boards', () => {
            const wrapper = shallow(
                <OffTopicIntroMessage
                    {...props}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <OffTopicIntroMessage
                    {...props}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
