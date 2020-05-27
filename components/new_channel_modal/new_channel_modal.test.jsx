// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {Permissions} from 'mattermost-redux/constants';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import Constants from 'utils/constants';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal.jsx';

describe('components/NewChannelModal', () => {
    const mockStore = configureStore();
    const channelData = {name: 'testchannel', displayName: 'testchannel', header: '', purpose: ''};
    const baseProps = {
        show: true,
        channelType: Constants.OPEN_CHANNEL,
        currentTeamId: 'test_team_id',
        channelData,
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        onSubmitChannel: jest.fn(),
        onModalDismissed: jest.fn(),
        onTypeSwitched: jest.fn(),
        onChangeURLPressed: jest.fn(),
        onDataChanged: jest.fn(),
    };

    test('should match snapshot, modal not showing', () => {
        const props = {...baseProps, show: false};
        const wrapper = shallow(
            <NewChannelModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(false);
    });

    test('should match snapshot, modal showing', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, display only public channel option', () => {
        const props = {...baseProps, canCreatePrivateChannel: false};
        const wrapper = shallow(
            <NewChannelModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, display only private channel option', () => {
        const props = {...baseProps, canCreatePublicChannel: false};
        const wrapper = shallow(
            <NewChannelModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, private channel filled in header and purpose', () => {
        const newChannelData = {name: 'testchannel', displayName: 'testchannel', header: 'some header', purpose: 'some purpose'};
        const props = {...baseProps, channelData: newChannelData, channelType: Constants.PRIVATE_CHANNEL};

        const wrapper = shallow(
            <NewChannelModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on displayNameError', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>,
        );
        wrapper.setState({displayNameError: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on serverError', () => {
        const props = {...baseProps, serverError: 'server error'};
        const wrapper = shallow(
            <NewChannelModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match when handleChange is called', () => {
        const state = {
            entities: {
                channels: {
                    myMembers: [],
                },
                teams: {
                    myMembers: [],
                },
                users: {
                    currentUserId: 'user_id',
                    profiles: {
                        user_id: {
                            id: 'user_id',
                            roles: 'system_admin',
                        },
                    },
                },
                roles: {
                    roles: {
                        system_admin: {
                            permissions: [
                                Permissions.CREATE_PUBLIC_CHANNEL,
                                Permissions.CREATE_PRIVATE_CHANNEL,
                            ],
                        },
                    },
                },
            },
        };
        const store = mockStore(state);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal {...baseProps}/>
            </Provider>,
        );
        const modal = wrapper.find(NewChannelModal).instance();

        wrapper.find('input#newChannelName').instance().value = 'new display_name';
        wrapper.find('textarea#newChannelHeader').instance().value = 'new channel_header';
        wrapper.find('textarea#newChannelPurpose').instance().value = 'new channel_purpose';

        modal.handleChange();

        expect(baseProps.onDataChanged).toHaveBeenCalledTimes(1);
        expect(baseProps.onDataChanged).toHaveBeenCalledWith({displayName: 'new display_name', header: 'new channel_header', purpose: 'new channel_purpose'});
    });

    test('should match when handleSubmit is called', () => {
        const state = {
            entities: {
                channels: {
                    myMembers: [],
                },
                teams: {
                    myMembers: [],
                },
                users: {
                    currentUserId: 'user_id',
                    profiles: {
                        user_id: {
                            id: 'user_id',
                            roles: '',
                        },
                    },
                },
                roles: {
                    roles: {
                    },
                },
            },
        };
        const store = mockStore(state);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal {...baseProps}/>
            </Provider>,
        );
        const modal = wrapper.find(NewChannelModal).instance();
        modal.handleSubmit({preventDefault: jest.fn()});

        expect(baseProps.onSubmitChannel).toHaveBeenCalledTimes(1);
        expect(modal.state.displayNameError).toEqual('');
    });

    test('should have called handleSubmit on onEnterKeyDown', () => {
        const wrapper = shallow(
            <NewChannelModal {...baseProps}/>,
        );
        wrapper.instance().handleSubmit = jest.fn();

        let evt = {ctrlSend: true, key: Constants.KeyCodes.ENTER[0], ctrlKey: true};
        wrapper.instance().onEnterKeyDown(evt);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledTimes(1);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledWith(evt);

        evt = {ctrlSend: false, key: Constants.KeyCodes.ENTER[0], shiftKey: false, altKey: false};
        wrapper.instance().onEnterKeyDown(evt);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledTimes(2);
        expect(wrapper.instance().handleSubmit).toHaveBeenCalledWith(evt);
    });

    test('should clear the display name error when showing', () => {
        const wrapper = shallow(
            <NewChannelModal
                {...baseProps}
                show={false}
            />,
        );

        wrapper.setState({displayNameError: 'an error'});
        wrapper.setProps({show: true});

        expect(wrapper.state('displayNameError')).toEqual('');
    });
});
