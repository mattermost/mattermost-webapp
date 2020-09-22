// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SidebarTutorialTip from './sidebar_tutorial_tip.jsx';

describe('component/legacy_sidebar/SidebarTutorialTip', () => {
    const defaultProps = {
        openLhs: jest.fn(),
    };
    test('should match snapshot, without townSquare and without offTopic', () => {
        const props = {...defaultProps};
        const wrapper = shallow(<SidebarTutorialTip {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).not.toBeCalled();
    });

    test('should match snapshot, with townSquare and without offTopic', () => {
        const props = {...defaultProps, townSquareDisplayName: 'TestTownSquare'};
        const wrapper = shallow(
            <SidebarTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).toBeCalled();
    });

    test('should match snapshot, without townSquare and with offTopic', () => {
        const props = {...defaultProps, offTopicDisplayName: 'TestOffTopic'};
        const wrapper = shallow(
            <SidebarTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).toBeCalled();
    });

    test('should match snapshot, with townSquare and with offTopic', () => {
        const props = {...defaultProps, townSquareDisplayName: 'TestTownSquare', offTopicDisplayName: 'TestOffTopic'};
        const wrapper = shallow(
            <SidebarTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).toBeCalled();
    });
});
