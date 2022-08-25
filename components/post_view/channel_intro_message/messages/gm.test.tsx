// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {boardComponent, groupChannel, users} from './test_utils';

import GMIntroMessage from './gm';

describe('components/post_view/ChannelIntroMessages', () => {
    const component = (otherProps: any) => {
        return (
            <GMIntroMessage
                currentUserId={'test-user-id'}
                profiles={[]}
                channel={groupChannel}
                {...otherProps}
            />
        );
    };

    describe('test Group Channel', () => {
        test('should match snapshot, no profiles', () => {
            expect(shallow(component({ }))).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, without boards', () => {
            expect(shallow(component({
                profiles: users,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with profiles, with boards', () => {
            expect(shallow(component({
                profiles: users,
                boardComponent,
            }))).toMatchSnapshot();
        });
    });
});
