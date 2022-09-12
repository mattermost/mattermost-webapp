// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {archivedChannel, offTopicChannel} from '../test_utils';

import OffTopicIntroMessage from './off_topic';

const component = (otherProps: any) => (
    <OffTopicIntroMessage
        channel={offTopicChannel}
        usersLimit={10}
        {...otherProps}
    />
);

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test OFF_TOPIC Channel', () => {
        test('should match snapshot, show board button', () => {
            expect(shallow(component({}))).toMatchSnapshot();
        });

        test('should match snapshot, do not show board button', () => {
            expect(shallow(component({
                channel: archivedChannel,
            }))).toMatchSnapshot();
        });
    });
});
