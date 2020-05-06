// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Modal} from 'react-bootstrap';
import {UserProfile} from 'mattermost-redux/src/types/users';

import AdminAckModal from 'components/admin_ack_modal/admin_ack_modal';

jest.mock('react-dom', () => ({
    findDOMNode: () => ({
        blur: jest.fn(),
    }),
}));

describe('components/AdminAckModal', () => {
    const serverError = 'some error';

    const baseProps = {
        user: {
            id: 'someUserId',
            first_name: 'Fake',
            last_name: 'Person',
            email: 'a@test.com'
        } as UserProfile,
        show: false,
        closeParentComponent: jest.fn(),
        actions: {
            closeModal: jest.fn(),
            sendAdminAck: jest.fn(),
        },
    };

    test('should match snapshot, init', () => {
        const wrapper = shallow<AdminAckModal>(
            <AdminAckModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('error display', () => {
        const wrapper = shallow<AdminAckModal>(
            <AdminAckModal {...baseProps}/>
        );

        wrapper.setState({serverError});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow<AdminAckModal>(
            <AdminAckModal {...baseProps}/>
        );

        wrapper.setState({saving: true});
        wrapper.instance().onHide();
        expect(wrapper.state('saving')).toEqual(false);
    });

    test('should match state when onHideWithParent is called', () => {
        const wrapper = shallow<AdminAckModal>(
            <AdminAckModal {...baseProps}/>
        );

        wrapper.setState({saving: true});
        wrapper.instance().onHideWithParent();

        expect(baseProps.closeParentComponent).toHaveBeenCalledTimes(1);
        expect(wrapper.state('saving')).toEqual(false);
    });

    test('send ack on submit button click', () => {
        const wrapper = shallow<AdminAckModal>(
            <AdminAckModal {...baseProps}/>
        );

        wrapper.setState({saving: true});
        wrapper.find('.save-button').simulate('click');
        expect(baseProps.actions.sendAdminAck).toHaveBeenCalledTimes(1);

        expect(baseProps.closeParentComponent).toHaveBeenCalledTimes(1);
        expect(wrapper.state('saving')).toEqual(false);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <AdminAckModal {...props}/>
        );

        wrapper.find(Modal).props().onExited!(document.createElement('div'));
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
    });
});