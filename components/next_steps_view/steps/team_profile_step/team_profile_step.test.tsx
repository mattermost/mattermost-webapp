// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

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
});
