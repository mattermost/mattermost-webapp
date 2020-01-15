// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelIdentifierRouter from './channel_identifier_router';

describe('components/channel_layout/CenterChannel', () => {
    const props = {

        match: {
            params: {
                identifier: 'identifier',
                team: 'team',
            }
        },

        actions: {
            onChannelByIdentifierEnter: jest.fn(),
        },
    };
    test('should call onChannelByIdentifierEnter on props change', () => {
        const wrapper = shallow(<ChannelIdentifierRouter {...props}/>);

        expect(props.actions.onChannelByIdentifierEnter).toHaveBeenCalledTimes(1);
        expect(props.actions.onChannelByIdentifierEnter).toHaveBeenLastCalledWith(props);

        const props2 = {
            match: {
                params: {
                    identifier: 'identifier2',
                    team: 'team2',
                }
            },
        };
        wrapper.setProps(props2);

        // expect(propsTest.match).toEqual(props2.match);

        expect(props.actions.onChannelByIdentifierEnter).toHaveBeenCalledTimes(2);
        expect(props.actions.onChannelByIdentifierEnter).toHaveBeenLastCalledWith({
            match: props2.match,
            actions: props.actions
        });
    });
});
