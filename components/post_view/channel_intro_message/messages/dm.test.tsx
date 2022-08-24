// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from '@mattermost/types/users';

import {boardComponent, directChannel, user1} from './utils';

import DMIntroMessage from './dm';

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test DIRECT Channel', () => {
        const component = (otherProps: any) => {
            return (
                <DMIntroMessage
                    channel={directChannel}
                    {...otherProps}
                />
            );
        };

        test('should match snapshot, without teammate', () => {
            expect(shallow(component({}))).toMatchSnapshot();
        });

        test('should match snapshot, with teammate, without boards', () => {
            expect(shallow(component({
                teammate: user1 as UserProfile,
                teammateName: 'my teammate',
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with teammate, with boards', () => {
            expect(shallow(component({
                teammate: user1 as UserProfile,
                boardComponent,
            }))).toMatchSnapshot();
        });
    });
});
