// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {browserHistory} from 'utils/browser_history';

import ChannelIdentifierRouter from './channel_identifier_router';

describe('components/channel_layout/CenterChannel', () => {
    const baseProps = {

        match: {
            params: {
                identifier: 'identifier',
                team: 'team',
            },
            url: '/team/channel/identifier',
        },

        actions: {
            onChannelByIdentifierEnter: jest.fn(),
        },
    };

    test('should call onChannelByIdentifierEnter on props change', () => {
        const wrapper = shallow(<ChannelIdentifierRouter {...baseProps}/>);

        expect(baseProps.actions.onChannelByIdentifierEnter).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.onChannelByIdentifierEnter).toHaveBeenLastCalledWith(baseProps);

        const props2 = {
            match: {
                params: {
                    identifier: 'identifier2',
                    team: 'team2',
                },
                url: '/team2/channel/identifier2',
            },
        };
        wrapper.setProps(props2);

        // expect(propsTest.match).toEqual(props2.match);

        expect(baseProps.actions.onChannelByIdentifierEnter).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.onChannelByIdentifierEnter).toHaveBeenLastCalledWith({
            match: props2.match,
            actions: baseProps.actions
        });
    });

    test('should call browserHistory.replace if it is permalink after timer', () => {
        const props = {
            ...baseProps,
            match: {
                params: {
                    identifier: 'identifier',
                    team: 'team',
                    postid: 'abcd',
                },
                url: '/team/channel/identifier/abcd',
            },
        };
        jest.useFakeTimers();
        browserHistory.replace = jest.fn();
        shallow(<ChannelIdentifierRouter {...props}/>);
        jest.runAllTimers();
        expect(browserHistory.replace).toHaveBeenLastCalledWith('/team/channel/identifier');
    });

    test('should call browserHistory.replace on props change to permalink', () => {
        const props = {
            ...baseProps,
            match: {
                params: {
                    identifier: 'identifier1',
                    team: 'team1',
                    postid: 'abcd',
                },
                url: '/team1/channel/identifier1/abcd',
            },
        };

        jest.useFakeTimers();
        browserHistory.replace = jest.fn();
        const wrapper = shallow(<ChannelIdentifierRouter {...baseProps}/>);
        wrapper.setProps(props);

        jest.runAllTimers();
        expect(browserHistory.replace).toHaveBeenLastCalledWith('/team1/channel/identifier1');
    });
});
