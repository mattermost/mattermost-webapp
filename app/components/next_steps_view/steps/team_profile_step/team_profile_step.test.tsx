// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import TeamProfileStep from './team_profile_step';

describe('components/next_steps_view/steps/team_profile_step', () => {
    const baseProps = {
        id: 'team_profile_step',
        onSkip: jest.fn(),
        onFinish: jest.fn(),
        currentUser: TestHelper.getUserMock(),
        team: TestHelper.getTeamMock(),
        maxFileSize: 1000000000,
        siteURL: 'http://a.site.url',
        expanded: true,
        isAdmin: true,
        actions: {
            patchTeam: jest.fn(),
            removeTeamIcon: jest.fn(),
            setTeamIcon: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <TeamProfileStep {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should only accept files that are of the expected types and within the max size', () => {
        const wrapper: ShallowWrapper<any, any, TeamProfileStep> = shallow(
            <TeamProfileStep {...baseProps}/>,
        );

        wrapper.instance().onSelectPicture({type: 'image/png', size: 100000} as any);
        expect(wrapper.state('profilePictureError')).toBe(false);
        expect(wrapper.state('profilePicture')).toStrictEqual({type: 'image/png', size: 100000});

        wrapper.instance().onSelectPicture({type: 'wrong/type', size: 100000} as any);
        expect(wrapper.state('profilePictureError')).toBe(true);

        wrapper.instance().onSelectPicture({type: 'image/png', size: 1000000001} as any);
        expect(wrapper.state('profilePictureError')).toBe(true);
    });
});
