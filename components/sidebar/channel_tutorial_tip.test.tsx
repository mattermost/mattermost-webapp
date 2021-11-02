// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import ChannelTutorialTip from './channel_tutorial_tip';

describe('component/legacy_sidebar/ChannelTutorialTip', () => {
    const defaultProps = {
        openLhs: jest.fn(),
    };
    test('should match snapshot, without townSquare and without offTopic', () => {
        const props = {...defaultProps};
        const wrapper = shallow(<ChannelTutorialTip {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).not.toBeCalled();
    });

    test('should match snapshot, with townSquare and without offTopic', () => {
        const props = {...defaultProps, townSquareDisplayName: 'TestTownSquare'};
        const wrapper = shallow(
            <ChannelTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).toBeCalled();
    });

    test('should match snapshot, without townSquare and with offTopic', () => {
        const props = {...defaultProps, offTopicDisplayName: 'TestOffTopic'};
        const wrapper = shallow(
            <ChannelTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).toBeCalled();
    });

    test('should match snapshot, with townSquare and with offTopic', () => {
        const props = {...defaultProps, townSquareDisplayName: 'TestTownSquare', offTopicDisplayName: 'TestOffTopic'};
        const wrapper = shallow(
            <ChannelTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.openLhs).toBeCalled();
    });

    test('should match snapshot, with firstChannelName set', () => {
        const props = {...defaultProps, firstChannelName: 'firstChannelName'};
        const wrapper = shallow(
            <ChannelTutorialTip {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('when setting up a first channel, the tutorial tip must show the first channel info tip', () => {
        const props = {...defaultProps, firstChannelName: 'firstChannelName'};
        const wrapper = shallow(
            <ChannelTutorialTip {...props}/>,
        );
        const telemetryTag = wrapper.prop('telemetryTag');
        expect(telemetryTag).toEqual('tutorial_tip_0_first_channel');
    });

    test('when there is not the first channel, the tutorial tip must show the normal channel tip', () => {
        const props = {...defaultProps, firstChannelName: ''};
        const wrapper = shallow(
            <ChannelTutorialTip {...props}/>,
        );
        const telemetryTag = wrapper.prop('telemetryTag');
        expect(telemetryTag).toEqual('tutorial_tip_2_channels');
    });
});
