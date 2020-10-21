// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {trackEvent} from 'actions/telemetry_actions.jsx';

import UserGuideDropdown from 'components/channel_header/components/user_guide_dropdown/user_guide_dropdown';
import * as GlobalActions from 'actions/global_actions.jsx';

jest.mock('actions/global_actions', () => ({
    toggleShortcutsModal: jest.fn(),
}));

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');

    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

describe('components/channel_header/components/UserGuideDropdown', () => {
    const baseProps = {
        helpLink: 'helpLink',
        reportAProblemLink: 'reportAProblemLink',
        enableAskCommunityLink: 'true',
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for false of enableAskCommunityLink', () => {
        const props = {
            ...baseProps,
            enableAskCommunityLink: 'false',
        };

        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Should set state buttonActive on toggle of MenuWrapper', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        expect(wrapper.state('buttonActive')).toBe(false);
        wrapper.find(MenuWrapper).prop('onToggle')(true);
        expect(wrapper.state('buttonActive')).toBe(true);
    });

    test('Should set state buttonActive on toggle of MenuWrapper', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        wrapper.find(Menu.ItemAction).prop('onClick')({preventDefault: jest.fn()});
        expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
    });

    test('Should call for track event on click of askTheCommunityLink', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        wrapper.find(Menu.ItemExternalLink).find('#askTheCommunityLink').prop('onClick')();
        expect(trackEvent).toBeCalledWith('ui', 'help_ask_the_community');
    });
});
