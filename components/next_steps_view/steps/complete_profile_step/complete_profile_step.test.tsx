// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import CompleteProfileStep from './complete_profile_step';

describe('components/next_steps_view/steps/complete_profile_step', () => {
    const baseProps = {
        id: 'complete_profile_step',
        onSkip: jest.fn(),
        onFinish: jest.fn(),
        currentUser: TestHelper.getUserMock(),
        maxFileSize: 1000000000,
        expanded: true,
        isAdmin: true,
        actions: {
            updateMe: jest.fn(),
            setDefaultProfileImage: jest.fn(),
            uploadProfileImage: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <CompleteProfileStep {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should only accept files that are of the expected types and within the max size', () => {
        const wrapper: ShallowWrapper<any, any, CompleteProfileStep> = shallow(
            <CompleteProfileStep {...baseProps}/>,
        );

        wrapper.instance().onSelectPicture({type: 'image/jpeg', size: 100000} as any);
        expect(wrapper.state('profilePictureError')).toBe(false);
        expect(wrapper.state('profilePicture')).toStrictEqual({type: 'image/jpeg', size: 100000});

        wrapper.instance().onSelectPicture({type: 'wrong/type', size: 100000} as any);
        expect(wrapper.state('profilePictureError')).toBe(true);

        wrapper.instance().onSelectPicture({type: 'image/jpeg', size: 1000000001} as any);
        expect(wrapper.state('profilePictureError')).toBe(true);
    });

    test('should update user name correctly', () => {
        const mockUser = TestHelper.getUserMock();
        const props = {
            ...baseProps,
            currentUser: mockUser,
        };

        const wrapper: ShallowWrapper<any, any, CompleteProfileStep> = shallow(
            <CompleteProfileStep {...props}/>,
        );

        wrapper.setState({fullName: 'John Smith'});
        wrapper.instance().onFinish();
        expect(props.actions.updateMe).toBeCalledWith({...mockUser, first_name: 'John', last_name: 'Smith'});
    });
});
