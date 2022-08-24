// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import {ChannelType} from '@mattermost/types/channels';

import {channel, boardComponent} from './utils.test';

import OffTopicIntroMessage from './off_topic';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
        stats: {},
        usersLimit: 10,
    };

    describe('test OFFTOPIC Channel', () => {
        const directChannel = {
            ...channel,
            type: Constants.OPEN_CHANNEL as ChannelType,
            name: Constants.OFFTOPIC_CHANNEL,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
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
