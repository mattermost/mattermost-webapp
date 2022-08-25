// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {boardComponent, offTopicChannel} from './test_utils';

import OffTopicIntroMessage from './off_topic';

describe('components/post_view/ChannelIntroMessages', () => {
    const component = (otherProps: any) => {
        return (
            <OffTopicIntroMessage
                stats={{}}
                usersLimit={10}
                channel={offTopicChannel}
                {...otherProps}
            />
        );
    };

    describe('test OFF_TOPIC Channel', () => {
        test('should match snapshot, without boards', () => {
            expect(shallow(component({ }))).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            expect(shallow(component({
                boardComponent,
            }))).toMatchSnapshot();
        });
    });
});
