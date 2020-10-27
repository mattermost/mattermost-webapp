// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import InviteMembersStep from './invite_members_step';

describe('components/next_steps_view/steps/invite_members_step', () => {
    const baseProps = {
        id: 'invite_members_step',
        team: TestHelper.getTeamMock(),
        onSkip: jest.fn(),
        onFinish: jest.fn(),
        currentUser: TestHelper.getUserMock(),
        expanded: true,
        isAdmin: true,
        isEmailInvitesEnabled: true,
        actions: {
            sendEmailInvitesToTeamGracefully: jest.fn(),
            regenerateTeamInviteId: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <InviteMembersStep {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should set emails based on specified delimiters', () => {
        const wrapper: ShallowWrapper<any, any, InviteMembersStep> = shallow(
            <InviteMembersStep {...baseProps}/>,
        );

        const emails = ['bob@joe.com', 'guy@dude.com', 'person@email.com'];

        wrapper.instance().onInputChange(emails.join(' '), {} as any);
        expect(wrapper.state('emails').map((email: any) => email.value)).toStrictEqual(emails);
        wrapper.setState({emails: []});

        wrapper.instance().onInputChange(emails.join(','), {} as any);
        expect(wrapper.state('emails').map((email: any) => email.value)).toStrictEqual(emails);
        wrapper.setState({emails: []});

        wrapper.instance().onInputChange(emails.join(':'), {} as any);
        expect(wrapper.state('emails').map((email: any) => email.value)).toStrictEqual([]);
        wrapper.setState({emails: []});
    });

    test('should not allow more than 10 emails', () => {
        const wrapper: ShallowWrapper<any, any, InviteMembersStep> = shallow(
            <InviteMembersStep {...baseProps}/>,
        );

        const emails = Array(11).fill('a').map((a) => `email_${a}@email.com`);

        wrapper.instance().onInputChange(emails.join(' '), {} as any);
        expect(wrapper.state('emails').map((email: any) => email.value)).toStrictEqual(emails);
        expect(wrapper.state('emailError')).not.toBe(undefined);
        wrapper.setState({emails: [], emailError: undefined});

        wrapper.instance().onInputChange(emails.slice(0, 10).join(' '), {} as any);
        expect(wrapper.state('emails').map((email: any) => email.value)).toStrictEqual(emails.slice(0, 10));
        expect(wrapper.state('emailError')).toBe(undefined);
        wrapper.setState({emails: [], emailError: undefined});
    });

    test('do not fire onChange unless it is a removal or a pop', () => {
        const wrapper: ShallowWrapper<any, any, InviteMembersStep> = shallow(
            <InviteMembersStep {...baseProps}/>,
        );

        const emails = Array(11).fill('a').map((a) => `email_${a}@email.com`);

        wrapper.instance().onChange(emails.map((e) => ({label: e, value: e, error: false})), {action: 'remove-value'});
        expect(wrapper.state('emails')).toStrictEqual(emails.map((e) => ({label: e, value: e, error: false})));

        wrapper.setState({emails: []});
        wrapper.instance().onChange(emails.map((e) => ({label: e, value: e, error: false})), {action: 'set-value'});
        expect(wrapper.state('emails')).toStrictEqual([]);
    });
});
