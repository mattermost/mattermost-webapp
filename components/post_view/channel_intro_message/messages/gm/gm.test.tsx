// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {boardComponent, groupChannel, users} from '../test_utils';

import GMIntroMessage from './gm';

const component = (otherProps: any) => {
    return (
        <GMIntroMessage
            currentUserId={'test-user-id'}
            channelProfiles={[]}
            channel={groupChannel}
            {...otherProps}
        />
    );
};

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test Group Channel', () => {
        test('should match snapshot, no profiles', () => {
            expect(shallow(component({ }))).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, without boards', () => {
            expect(shallow(component({
                channelProfiles: users,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, with boards', () => {
            expect(shallow(component({
                channelProfiles: users,
                boardComponent,
            }))).toMatchSnapshot();
        });
    });
});
