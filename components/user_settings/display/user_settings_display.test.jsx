// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {shallow} from 'enzyme';
import configureStore from 'redux-mock-store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import UserSettingsDisplay from 'components/user_settings/display/user_settings_display.jsx';

describe('components/user_settings/display/UserSettingsDisplay', () => {
    const user = {
        id: 'user_id',
        username: 'username',
        locale: 'en',
        timezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
    };

    const requiredProps = {
        user,
        updateSection: jest.fn(),
        updateTab: jest.fn(),
        activeSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        setRequireConfirm: jest.fn(),
        setEnforceFocus: jest.fn(),
        enableLinkPreviews: true,
        enableThemeSelection: false,
        defaultClientLocale: 'en',
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        timezones: [
            'America/New_York',
            'America/Los_Angeles',
        ],
        userTimezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
        actions: {
            getSupportedTimezones: jest.fn(),
            autoUpdateTimezone: jest.fn(),
            savePreferences: jest.fn(),
        },
    };
    const mockStore = configureStore();
    const state = {
        views: {
            settings: {},
        },
    };

    const store = mockStore(state);

    test('should match snapshot, no active section', () => {
        const wrapper = shallow(<UserSettingsDisplay {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, collapse section', () => {
        const props = {...requiredProps, activeSection: 'collapse'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, link preview section with EnableLinkPreviews is false', () => {
        const props = {
            ...requiredProps,
            activeSection: 'linkpreview',
            enableLinkPreviews: false,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, link preview section with EnableLinkPreviews is true', () => {
        const props = {
            ...requiredProps,
            activeSection: 'linkpreview',
            enableLinkPreviews: true,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, clock section', () => {
        const props = {...requiredProps, activeSection: 'clock'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, teammate name display section', () => {
        const props = {...requiredProps, activeSection: 'teammate_name_display'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, timezone section', () => {
        const props = {...requiredProps, activeSection: 'timezone'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, message display section', () => {
        const props = {...requiredProps, activeSection: 'message_display'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel display mode section', () => {
        const props = {...requiredProps, activeSection: 'channel_display_mode'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, languages section', () => {
        const props = {...requiredProps, activeSection: 'languages'};
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, theme section with EnableThemeSelection is false', () => {
        const props = {
            ...requiredProps,
            activeSection: 'theme',
            enableThemeSelection: false,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, theme section with EnableThemeSelection is true', () => {
        const props = {
            ...requiredProps,
            activeSection: 'theme',
            enableThemeSelection: true,
        };
        const wrapper = shallow(<UserSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called handleSubmit', async () => {
        const updateSection = jest.fn();

        const props = {...requiredProps, updateSection};
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...props}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        await wrapper.instance().handleSubmit();
        expect(updateSection).toHaveBeenCalledWith('');
    });

    test('should have called updateSection', () => {
        const updateSection = jest.fn();
        const props = {...requiredProps, updateSection};
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...props}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().updateSection('');
        expect(updateSection).toHaveBeenCalledWith('');

        wrapper.instance().updateSection('linkpreview');
        expect(updateSection).toHaveBeenCalledWith('linkpreview');
    });

    test('should have called closeModal', () => {
        const closeModal = jest.fn();
        const props = {...requiredProps, closeModal};
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...props}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.find('#closeButton').simulate('click');
        expect(closeModal).toHaveBeenCalled();
    });

    test('should have called collapseModal', () => {
        const collapseModal = jest.fn();
        const props = {...requiredProps, collapseModal};
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...props}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.find('.fa-angle-left').simulate('click');
        expect(collapseModal).toHaveBeenCalled();
    });

    test('should update militaryTime state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handleClockRadio('false');
        expect(wrapper.state('militaryTime')).toBe('false');

        wrapper.instance().handleClockRadio('true');
        expect(wrapper.state('militaryTime')).toBe('true');
    });

    test('should update teammateNameDisplay state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handleTeammateNameDisplayRadio('username');
        expect(wrapper.state('teammateNameDisplay')).toBe('username');

        wrapper.instance().handleTeammateNameDisplayRadio('nickname_full_name');
        expect(wrapper.state('teammateNameDisplay')).toBe('nickname_full_name');

        wrapper.instance().handleTeammateNameDisplayRadio('full_name');
        expect(wrapper.state('teammateNameDisplay')).toBe('full_name');
    });

    test('should update channelDisplayMode state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handleChannelDisplayModeRadio('full');
        expect(wrapper.state('channelDisplayMode')).toBe('full');

        wrapper.instance().handleChannelDisplayModeRadio('centered');
        expect(wrapper.state('channelDisplayMode')).toBe('centered');
    });

    test('should update messageDisplay state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handlemessageDisplayRadio('clean');
        expect(wrapper.state('messageDisplay')).toBe('clean');

        wrapper.instance().handlemessageDisplayRadio('compact');
        expect(wrapper.state('messageDisplay')).toBe('compact');
    });

    test('should update collapseDisplay state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handleCollapseRadio('false');
        expect(wrapper.state('collapseDisplay')).toBe('false');

        wrapper.instance().handleCollapseRadio('true');
        expect(wrapper.state('collapseDisplay')).toBe('true');
    });

    test('should update linkPreviewDisplay state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handleLinkPreviewRadio('false');
        expect(wrapper.state('linkPreviewDisplay')).toBe('false');

        wrapper.instance().handleLinkPreviewRadio('true');
        expect(wrapper.state('linkPreviewDisplay')).toBe('true');
    });

    test('should update display state', () => {
        const wrapper = mountWithIntl(
            <UserSettingsDisplay {...requiredProps}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.instance().handleOnChange({display: 'linkPreviewDisplay'});
        expect(wrapper.state('display')).toBe('linkPreviewDisplay');

        wrapper.instance().handleOnChange({display: 'collapseDisplay'});
        expect(wrapper.state('display')).toBe('collapseDisplay');
    });
});
