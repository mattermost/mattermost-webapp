// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';
import {noop as emptyFunction} from 'lodash';

import MoreDirectChannels from 'components/more_direct_channels/more_direct_channels';

jest.useFakeTimers();
describe('components/MoreDirectChannels', () => {
    const baseProps = {
        currentUserId: 'current_user_id',
        currentTeamId: 'team_id',
        currentTeamName: 'team_name',
        searchTerm: '',
        totalCount: 3,
        users: [
            {
                id: 'user_id_1',
                label: 'user_id_1',
                value: 'user_id_1',
                delete_at: 0,
            },
            {
                id: 'user_id_2',
                label: 'user_id_2',
                value: 'user_id_2',
                delete_at: 0,
            },
            {
                id: 'user_id_3',
                label: 'user_id_3',
                value: 'user_id_3',
                delete_at: 0,
            },
        ],
        recentDirectChannelUsers: [],
        currentChannelMembers: [
            {
                id: 'user_id_1',
                label: 'user_id_1',
                value: 'user_id_1',
            },
            {
                id: 'user_id_2',
                label: 'user_id_2',
                value: 'user_id_2',
            },
        ],
        isExistingChannel: false,
        restrictDirectMessage: 'any',
        onModalDismissed: emptyFunction,
        onExited: emptyFunction,
        actions: {
            getProfiles: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
            getProfilesInTeam: emptyFunction,
            loadProfilesMissingStatus: emptyFunction,
            searchProfiles: emptyFunction,
            searchGroupChannels: emptyFunction,
            setModalSearchTerm: emptyFunction,
            loadStatusesForProfilesList: emptyFunction,
            loadProfilesForGroupChannels: emptyFunction,
            openDirectChannelToUserId: jest.fn().mockResolvedValue({data: {name: 'dm'}}),
            openGroupChannelToUserIds: jest.fn().mockResolvedValue({data: {name: 'group'}}),
            getTotalUsersStats: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps, actions: {...baseProps.actions, loadProfilesMissingStatus: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call for modal data on callback of modal onEntered', () => {
        const props = {...baseProps, actions: {...baseProps.actions, loadProfilesMissingStatus: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.find(Modal).prop('onEntered')();

        expect(props.actions.getProfiles).toHaveBeenCalledTimes(1);
        expect(props.actions.getTotalUsersStats).toHaveBeenCalledTimes(1);
        expect(props.actions.getProfiles).toBeCalledWith(0, 100);
        expect(props.actions.loadProfilesMissingStatus).toHaveBeenCalledTimes(1);
        expect(props.actions.loadProfilesMissingStatus).toBeCalledWith(baseProps.users);
    });

    test('should call actions.loadProfilesMissingStatus on componentDidUpdate when users prop changes length', () => {
        const props = {...baseProps, actions: {...baseProps.actions, loadProfilesMissingStatus: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        const newUsers = [{
            id: 'user_id_1',
            label: 'user_id_1',
            value: 'user_id_1',
            delete_at: 0,
        }];

        wrapper.setProps({users: newUsers});
        expect(props.actions.loadProfilesMissingStatus).toHaveBeenCalledTimes(1);
        expect(props.actions.loadProfilesMissingStatus).toBeCalledWith(newUsers);
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
        jest.useFakeTimers('modern');
        const props = {...baseProps, actions: {...baseProps.actions, setModalSearchTerm: jest.fn()}};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        wrapper.instance().search('user_search');
        expect(props.actions.setModalSearchTerm).not.toBeCalled();
        jest.runAllTimers();
        expect(props.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(props.actions.setModalSearchTerm).toBeCalledWith('user_search');
    });

    test('should match state on handleDelete', () => {
        const props = {...baseProps};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        const user1 = {
            id: 'user_id_1',
            label: 'user_id_1',
            value: 'user_id_1',
        };

        const user2 = {
            id: 'user_id_1',
            label: 'user_id_1',
            value: 'user_id_1',
        };

        wrapper.setState({values: [user1]});
        wrapper.instance().handleDelete([user2]);
        expect(wrapper.state('values')).toEqual([user2]);
    });

    test('should not open a DM or GM if no user Ids', () => {
        const props = {...baseProps, currentChannelMembers: []};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);

        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(false);
        expect(baseProps.actions.openDirectChannelToUserId).not.toBeCalled();
    });

    test('should open a DM', (done) => {
        jest.useFakeTimers('legacy');
        const user = {
            id: 'user_id_1',
            label: 'user_label_1',
            value: 'user_value_1',
        };
        const props = {...baseProps, currentChannelMembers: [user]};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        const handleHide = jest.fn();
        const exitToChannel = null;

        wrapper.instance().handleHide = handleHide;
        wrapper.instance().exitToChannel = exitToChannel;
        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(true);
        expect(props.actions.openDirectChannelToUserId).toHaveBeenCalledTimes(1);
        expect(props.actions.openDirectChannelToUserId).toHaveBeenCalledWith('user_id_1');
        process.nextTick(() => {
            expect(wrapper.state('saving')).toEqual(false);
            expect(handleHide).toBeCalled();
            expect(wrapper.instance().exitToChannel).toEqual(`/${props.currentTeamName}/channels/dm`);
            done();
        });
    });

    test('should open a GM', (done) => {
        jest.useFakeTimers('legacy');
        const wrapper = shallow(<MoreDirectChannels {...baseProps}/>);
        const handleHide = jest.fn();
        const exitToChannel = null;

        wrapper.instance().handleHide = handleHide;
        wrapper.instance().exitToChannel = exitToChannel;
        wrapper.instance().handleSubmit();
        expect(wrapper.state('saving')).toEqual(true);
        expect(baseProps.actions.openGroupChannelToUserIds).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.openGroupChannelToUserIds).toHaveBeenCalledWith(['user_id_1', 'user_id_2']);
        process.nextTick(() => {
            expect(wrapper.state('saving')).toEqual(false);
            expect(handleHide).toBeCalled();
            expect(wrapper.instance().exitToChannel).toEqual(`/${baseProps.currentTeamName}/channels/group`);
            done();
        });
    });

    test('should exclude deleted users if there is not direct channel between users', () => {
        const users = [
            {
                id: 'user_id_1',
                label: 'user_id_1',
                value: 'user_id_1',
                delete_at: 0,
            },
            {
                id: 'user_id_2',
                label: 'user_id_2',
                value: 'user_id_2',
                delete_at: 0,
            },
            {
                id: 'deleted_user_1',
                label: 'deleted_user_id_1',
                value: 'deleted_user_id_1',
                delete_at: 1,
            },
            {
                id: 'deleted_user_2',
                label: 'deleted_user_id_2',
                value: 'deleted_user_id_2',
                delete_at: 1,
            },
            {
                id: 'deleted_user_3',
                label: 'deleted_user_id_3',
                value: 'deleted_user_id_3',
                delete_at: 1,
            },
        ];
        const myDirectChannels = [
            {name: 'deleted_user_1__current_user_id'},
            {name: 'not_existent_user_1__current_user_id'},
            {name: 'current_user_id__deleted_user_2'},
        ];
        const currentChannelMembers = [];
        const props = {...baseProps, users, myDirectChannels, currentChannelMembers};
        const wrapper = shallow(<MoreDirectChannels {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
