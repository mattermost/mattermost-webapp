// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SidebarTutorialTip from 'components/sidebar/sidebar_tutorial_tip.jsx';

describe('component/sidebar/SidebarTutorialTip', () => {
    test('should match snapshot, without townSquare and without offTopic', () => {
        const wrapper = shallow(<SidebarTutorialTip/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with townSquare and without offTopic', () => {
        const wrapper = shallow(
            <SidebarTutorialTip
                townSquareDisplayName={'TestTownSquare'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without townSquare and with offTopic', () => {
        const wrapper = shallow(
            <SidebarTutorialTip
                offTopicDisplayName={'TestOffTopic'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with townSquare and with offTopic', () => {
        const wrapper = shallow(
            <SidebarTutorialTip
                townSquareDisplayName={'TestTownSquare'}
                offTopicDisplayName={'TestOffTopic'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
