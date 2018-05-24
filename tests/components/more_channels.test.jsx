// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MoreChannels from 'components/more_channels/more_channels.jsx';

describe('components/MoreChannels', () => {
    const baseProps = {
        channels: [{id: 'channel_id_1'}],
        teamId: 'team_id',
        teamName: 'team_name',
        onModalDismissed: () => {}, // eslint-disable-line no-empty-function
        handleNewChannel: () => {}, // eslint-disable-line no-empty-function
        actions: {
            getChannels: () => {}, // eslint-disable-line no-empty-function
        },
    };

    test('should match snapshot and state', () => {
        const actions = {getChannels: jest.fn()};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <MoreChannels {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('searchedChannels')).toEqual([]);
        expect(wrapper.state('show')).toEqual(true);
        expect(wrapper.state('search')).toEqual(false);
        expect(wrapper.state('serverError')).toBeNull();

        // on componentDidMount
        expect(actions.getChannels).toHaveBeenCalledTimes(1);
        expect(actions.getChannels).toHaveBeenCalledWith(props.teamId, 0, 100);
    });

    test('should match state on handleHide', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );
        wrapper.setState({show: true});
        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should call props.onModalDismissed on handleExit', () => {
        const props = {...baseProps, onModalDismissed: jest.fn()};
        const wrapper = shallow(
            <MoreChannels {...props}/>
        );

        wrapper.instance().handleExit();
        expect(props.onModalDismissed).toHaveBeenCalledTimes(1);
        expect(props.onModalDismissed).toHaveBeenCalledWith();
    });

    test('should match state on onChange', () => {
        const wrapper = shallow(
            <MoreChannels {...baseProps}/>
        );
        wrapper.setState({searchedChannels: [{id: 'other_channel_id'}]});
        wrapper.instance().onChange();
        expect(wrapper.state('searchedChannels')).toEqual([]);

        // on search
        wrapper.setState({search: true});
        expect(wrapper.instance().onChange(false)).toEqual();
    });

    test('should call props.getChannels on nextPage', () => {
        const actions = {getChannels: jest.fn()};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <MoreChannels {...props}/>
        );

        wrapper.instance().nextPage(1);

        expect(actions.getChannels).toHaveBeenCalledTimes(2);
        expect(actions.getChannels).toHaveBeenCalledWith(props.teamId, 2, 50);
    });
});
