// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SignupSurvey from 'components/signup/signup_survey/signup_survey';
import {browserHistory} from 'utils/browser_history';
import {StoragePrefixes, SurveyTypes, SignupSurveyTelemetryEvents} from 'utils/constants';
import RadioSetting from '../../widgets/settings/radio_setting';

describe('components/SignupSurvey', () => {
    const defaultProps = {
        location: {
            state: {
                next: '/team-name',
            },
        },
        currentUserId: 'abc123',
        currentUserRoles: 'system_admin system_user',
        signupSurveyUserId: 'abc123',
        siteName: 'Mattermost',
        customDescriptionText: '',
        diagnosticsEnabled: true,
        actions: {
            removeGlobalItem: jest.fn().mockResolvedValue({data: true}),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SignupSurvey
                {...defaultProps}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match redirect snapshot if not system_admin', () => {
        const wrapper = shallow(
            <SignupSurvey
                {...defaultProps}
                currentUserRoles='system_user'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match redirect snapshot if not survey user', () => {
        const wrapper = shallow(
            <SignupSurvey
                {...defaultProps}
                currentUserId='xyz123'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match redirect snapshot if diagnostics is disabled', () => {
        const wrapper = shallow(
            <SignupSurvey
                {...defaultProps}
                diagnosticsEnabled={false}
                currentUserId='xyz123'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match redirect snapshot if next not provided', () => {
        const wrapper = shallow(
            <SignupSurvey
                {...defaultProps}
                location={{}}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should response to radio changes', () => {
        const wrapper = shallow<SignupSurvey>(
            <SignupSurvey
                {...defaultProps}
            />
        );

        wrapper.find(RadioSetting).prop('onChange')('', SignupSurveyTelemetryEvents.LONG_TERM);
        expect(wrapper.instance().state.serverPurpose).toBe(SignupSurveyTelemetryEvents.LONG_TERM);
    });

    it('should proceed to next after submission', async () => {
        browserHistory.push = jest.fn();

        const wrapper = shallow<SignupSurvey>(
            <SignupSurvey
                {...defaultProps}
            />
        );

        wrapper.find('#signupSurveyFinishButton').simulate('click', {preventDefault: jest.fn()});
        expect(defaultProps.actions.removeGlobalItem).toBeCalledWith(StoragePrefixes.SURVEY + SurveyTypes.SIGNUP);
        expect(browserHistory.push).toHaveBeenCalledWith(defaultProps.location.state.next);
    });
});
