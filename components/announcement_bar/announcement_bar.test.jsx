// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import 'tests/helpers/localstorage.jsx';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar/announcement_bar.jsx';

describe('components/AnnouncementBar', () => {
    const baseProps = {
        isLoggedIn: true,
        canViewSystemErrors: false,
        canViewAPIv3Banner: false,
        license: {
            id: '',
        },
        siteURL: '',
        sendEmailNotifications: true,
        enablePreviewMode: false,
        bannerText: 'Banner text',
        allowBannerDismissal: true,
        enableBanner: true,
        bannerColor: 'green',
        bannerTextColor: 'black',
        enableSignUpWithGitLab: false,
        message: 'text',
        announcementBarCount: 0,
        actions: {
            sendVerificationEmail: jest.fn(),
            incrementAnnouncementBarCount: jest.fn(),
            decrementAnnouncementBarCount: jest.fn(),
        },
    };

    test('should match snapshot, bar showing', () => {
        const props = baseProps;
        const wrapper = shallow(
            <AnnouncementBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, bar not showing', () => {
        const props = {...baseProps, enableBanner: false};
        const wrapper = shallow(
            <AnnouncementBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, bar showing, no dismissal', () => {
        const props = {...baseProps, allowBannerDismissal: false};
        const wrapper = shallow(
            <AnnouncementBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, props change', () => {
        const props = baseProps;
        const wrapper = shallow(
            <AnnouncementBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();

        const newProps = {...baseProps, bannerColor: 'yellow', bannerTextColor: 'red'};
        wrapper.setProps(newProps);
        expect(wrapper).toMatchSnapshot();

        newProps.allowBannerDismissal = false;
        wrapper.setProps(newProps);
        expect(wrapper).toMatchSnapshot();

        newProps.enableBanner = false;
        wrapper.setProps(newProps);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, dismissal', () => {
        const props = baseProps;
        const wrapper = shallow(
            <AnnouncementBar {...props}/>,
        );

        // Banner should show
        expect(wrapper).toMatchSnapshot();

        // Banner should remain hidden
        const newProps = {...baseProps, bannerColor: 'yellow', bannerTextColor: 'red'};
        wrapper.setProps(newProps);
        expect(wrapper).toMatchSnapshot();

        // Banner should return
        newProps.bannerText = 'Some new text';
        wrapper.setProps(newProps);
        expect(wrapper).toMatchSnapshot();
    });
});
