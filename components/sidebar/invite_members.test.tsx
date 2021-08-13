// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {InviteMembersBtnLocations} from 'mattermost-redux/constants/config';

import InviteMembersButton from 'components/sidebar/invite_members_button';

import * as preferences from 'mattermost-redux/selectors/entities/preferences';

describe('components/sidebar/invite_members_button', () => {
    // required state to mount using the provider
    const state = {
        entities: {
            general: {
                config: {
                    FeatureFlagInviteMembersButton: 'user_icon',
                },
            },
        },
    };

    const mockStore = configureStore();
    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <InviteMembersButton buttonType={InviteMembersBtnLocations.NONE}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should return the user icon button when button type is USER_ICON', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        preferences.getInviteMembersButtonLocation = jest.fn().mockReturnValue('user_icon');

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.USER_ICON}/>
            </Provider>,
        );
        expect(wrapper.find('i').prop('className')).toBe('icon-account-plus-outline');
    });

    test('should return the left hand side button when button type is LHS_BUTTON', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        preferences.getInviteMembersButtonLocation = jest.fn().mockReturnValue('lhs_button');
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.LHS_BUTTON}/>
            </Provider>,
        );
        expect(wrapper.find('i').prop('className')).toBe('icon-plus-box');
    });

    test('should return the sticky to the bottom button when button type is STICKY', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        preferences.getInviteMembersButtonLocation = jest.fn().mockReturnValue('sticky_button');
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.STICKY}/>
            </Provider>,
        );
        expect(wrapper.find('i').prop('className')).toBe('icon-account-plus-outline');
    });

    test('should returnnothing when button type is NONE', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        preferences.getInviteMembersButtonLocation = jest.fn().mockReturnValue('none');
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InviteMembersButton buttonType={InviteMembersBtnLocations.NONE}/>
            </Provider>,
        );
        expect(wrapper.find('i').exists()).toBeFalsy();
    });
});
