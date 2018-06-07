// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MoreDirectChannels from 'components/more_direct_channels/more_direct_channels.jsx';

jest.useFakeTimers();

describe('components/MoreDirectChannels', () => {
    function emptyFunction() {} //eslint-disable-line no-empty-function

    const baseProps = {
        currentUserId: 'current_user_id',
        currentTeamId: 'team_id',
        currentTeamName: 'team_name',
        searchTerm: '',
        users: [{id: 'user_id_1', delete_at: 0}, {id: 'user_id_2', delete_at: 0}, {id: 'user_id_3', delete_at: 0}],
        statuses: {user_id_1: 'online', user_id_2: 'away'},
        currentChannelMembers: [{id: 'user_id_1'}, {id: 'user_id_2'}],
        isExistingChannel: false,
        restrictDirectMessage: 'any',
        onModalDismissed: emptyFunction,
        onHide: emptyFunction,
        actions: {
            getProfiles: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
            getProfilesInTeam: emptyFunction,
            getStatusesByIds: emptyFunction,
            searchProfiles: emptyFunction,
            setModalSearchTerm: emptyFunction,
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps, actions: {...baseProps.actions, getStatusesByIds: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        expect(wrapper).toMatchSnapshot();

        // on componentDidMount
        expect(props.actions.getProfiles).toHaveBeenCalledTimes(1);
        expect(props.actions.getProfiles).toBeCalledWith(0, 100);
        expect(props.actions.getStatusesByIds).toHaveBeenCalledTimes(1);
        expect(props.actions.getStatusesByIds).toBeCalledWith(['user_id_3']);

        // on componentWillReceiveProps
        wrapper.setProps({statuses: {user_id_1: 'online', user_id_2: 'away', user_id_3: 'offline'}});
        expect(props.actions.getStatusesByIds).toHaveBeenCalledTimes(1);
    });

    test('should call actions.getStatusesByIds on loadProfilesMissingStatus', () => {
        const props = {...baseProps, actions: {...baseProps.actions, getStatusesByIds: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.instance().loadProfilesMissingStatus(props.users, props.statuses);
        expect(props.actions.getStatusesByIds).toHaveBeenCalledTimes(2);
        expect(props.actions.getStatusesByIds).toBeCalledWith(['user_id_3']);

        props.statuses = {user_id_1: 'online', user_id_2: 'away', user_id_3: 'offline'};
        wrapper.instance().loadProfilesMissingStatus(props.users, props.statuses);
        expect(props.actions.getStatusesByIds).toHaveBeenCalledTimes(2);
    });

    test('should call actions.setModalSearchTerm and match state on handleHide', () => {
        const props = {...baseProps, actions: {...baseProps.actions, setModalSearchTerm: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.setState({show: true});

        wrapper.instance().handleHide();
        expect(props.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(props.actions.setModalSearchTerm).toBeCalledWith('');
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should match state on setUsersLoadingState', () => {
        const props = {...baseProps};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.setState({loadingUsers: true});
        wrapper.instance().setUsersLoadingState(false);
        expect(wrapper.state('loadingUsers')).toEqual(false);

        wrapper.setState({loadingUsers: false});
        wrapper.instance().setUsersLoadingState(true);
        expect(wrapper.state('loadingUsers')).toEqual(true);
    });

    test('should call on search', () => {
        const props = {...baseProps, actions: {...baseProps.actions, setModalSearchTerm: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.instance().search('user_search');
        expect(props.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(props.actions.setModalSearchTerm).toBeCalledWith('user_search');
    });

    test('should match state on handleDelete', () => {
        const props = {...baseProps};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.setState({values: [{id: 'user_id_1'}]});
        wrapper.instance().handleDelete([{id: 'user_id_2'}]);
        expect(wrapper.state('values')).toEqual([{id: 'user_id_2'}]);
    });

    test('should match renderOption snapshot', () => {
        const props = {...baseProps};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        expect(wrapper.instance().renderOption({id: 'user_id_1', delete_at: 0}, true, jest.fn())).toMatchSnapshot();
    });

    test('should match output on renderValue', () => {
        const wrapper = shallow(<MoreDirectChannels {...baseProps}/>);

        expect(wrapper.instance().renderValue({id: 'user_id_2', username: 'username'})).toEqual('username');
    });

    test('should match output on handleSubmitImmediatelyOn', () => {
        const wrapper = shallow(<MoreDirectChannels {...baseProps}/>);

        expect(wrapper.instance().handleSubmitImmediatelyOn({id: 'current_user_id', delete_at: 0})).toEqual(true);
        expect(wrapper.instance().handleSubmitImmediatelyOn({id: 'user_id_2', delete_at: 123})).toEqual(true);
        expect(wrapper.instance().handleSubmitImmediatelyOn({id: 'user_id_2', delete_at: 0})).toEqual(false);
    });
});
