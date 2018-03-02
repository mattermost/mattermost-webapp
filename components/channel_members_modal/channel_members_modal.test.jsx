// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import {Modal} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import ChannelMembersModal from 'components/channel_members_modal/channel_members_modal';

describe('components/ChannelMembersModal', () => {
    let createComponent;
    let props;
    let reduxState;
    beforeEach(() => {
        props = {
            channel: {
                display_name: 'testchannel',
                header: '',
                name: 'testchannel',
                purpose: '',
            },
        };
        reduxState = {};
        function reducer() {
            return reduxState;
        }
        createComponent = () => {
            function Wrapped() {
                return (
                    <Provider store={createStore(combineReducers(reducer), {}, applyMiddleware(thunk))}>
                        <ChannelMembersModal {...props}/>
                    </Provider>
                );
            }
            return Wrapped;
        };
    });

    test('renders the channel display name', () => {
        const Component = createComponent();
        const wrapper = mountWithIntl(
            <Component/>
        );
        expect(wrapper.find('.name').text()).toBe(props.channel.display_name);
    });

    test('should call the onHide callback when the modal is hidden', () => {
        const Component = createComponent();
        props.onModalDismissed = jest.fn();
        const wrapper = mountWithIntl(
            <Component/>
        );
        expect(props.onModalDismissed).not.toHaveBeenCalled();
        wrapper.find(Modal).first().props().onExited();
        expect(props.onModalDismissed).toHaveBeenCalled();
    });

    test('should show the invite modal link if the user can manage channel members', () => {
        const Component = createComponent();
        props.canManageChannelMembers = true;
        const wrapper = mountWithIntl(
            <Component/>
        );
        expect(wrapper.find('#showInviteModal').length).toBe(1);
    });

    test('should not show the invite modal link if the user can not manage channel members', () => {
        const Component = createComponent();
        props.canManageChannelMembers = false;
        const wrapper = mountWithIntl(
            <Component/>
        );
        expect(wrapper.find('#showInviteModal').length).toBe(0);
    });

    test('should call showInviteModal when the invite modal link is clicked', () => {
        const Component = createComponent();
        props.canManageChannelMembers = true;
        props.showInviteModal = jest.fn();
        const wrapper = mountWithIntl(
            <Component/>
        );
        expect(props.showInviteModal).not.toHaveBeenCalled();
        wrapper.find('#showInviteModal').first().simulate('click');
        expect(props.showInviteModal).toHaveBeenCalled();
    });

    test('closes the Bootstrap modal when the modal close button is clicked', () => {
        const Component = createComponent();
        const wrapper = mountWithIntl(
            <Component/>
        );
        expect(wrapper.find('.modal').first().hasClass('in')).toBe(true);
        wrapper.find('button').first().simulate('click');
        expect(wrapper.find('.modal').first().hasClass('in')).toBe(false);
    });
});
