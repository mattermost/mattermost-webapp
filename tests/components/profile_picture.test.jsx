// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ProfilePicture from 'components/profile_picture.jsx';

describe('components/ProfilePicture', () => {
    const baseProps = {
        src: 'http://example.com/image.png',
        status: 'away',
        isBusy: true,
    };

    test('should match snapshot, no user specified, default props', () => {
        const props = baseProps;
        const wrapper = shallow(
            <ProfilePicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, no user specified, overridden props', () => {
        const props = {
            ...baseProps,
            width: '48',
            height: '48',
            isRHS: true,
            hasMention: true,
        };
        const wrapper = shallow(
            <ProfilePicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, user specified', () => {
        const props = {
            ...baseProps,
            user: {
                username: 'username',
            },
        };
        const wrapper = shallow(
            <ProfilePicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, user specified, overridden props', () => {
        const props = {
            ...baseProps,
            user: {
                username: 'username',
            },
            width: '48',
            height: '48',
            isRHS: true,
            hasMention: true,
        };
        const wrapper = shallow(
            <ProfilePicture {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
