// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {channel} from '../test_utils';

import StandardIntroMessage from './standard';

const component = (otherProps: any) => {
    return (
        <StandardIntroMessage
            channel={channel}
            locale={'en'}
            creatorName={'creatorName'}
            usersLimit={10}
            {...otherProps}
        />
    );
};

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test Open Channel', () => {
        test('should match snapshot', () => {
            expect(shallow(component({ }))).toMatchSnapshot();
        });
    });
});
