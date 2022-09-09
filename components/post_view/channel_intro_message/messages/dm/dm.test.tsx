// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from '@mattermost/types/users';
import {bot1, directChannel, user1} from '../test_utils';

import DMIntroMessage from './dm';

const component = (otherProps: any) => {
    return (
        <DMIntroMessage
            channel={directChannel}
            {...otherProps}
        />
    );
};

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test DIRECT Channel', () => {
        test('should match snapshot, without teammate', () => {
            expect(shallow(component({}))).toMatchSnapshot();
        });

        test('should match snapshot, with teammate', () => {
            expect(shallow(component({
                teammate: user1 as UserProfile,
                teammateName: 'my teammate',
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with bot teammate', () => {
            expect(shallow(component({
                teammate: bot1 as UserProfile,
                teammateName: 'my teammate',
            }))).toMatchSnapshot();
        });
    });
});
