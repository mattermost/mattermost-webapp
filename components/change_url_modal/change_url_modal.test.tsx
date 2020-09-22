// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ChangeURLModal from 'components/change_url_modal/change_url_modal';

describe('components/ChangeURLModal', () => {
    const baseProps = {
        show: true,
        onDataChanged: jest.fn(),
        currentTeamURL: 'http://example.com/channel/',
        onModalSubmit: jest.fn(),
        onModalDismissed: jest.fn(),
    };

    test('should match snapshot, modal not showing', () => {
        const props = {...baseProps, show: false};
        const wrapper = shallow(
            <ChangeURLModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(false);
    });

    test('should match snapshot, modal showing', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, with a input', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <ChangeURLModal {...props}/>,
        );
        const input = wrapper.find('input');
        expect(wrapper).toMatchSnapshot();
        expect(input.length).toEqual(1);
    });

    test('should match snapshot, on urlErrors', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>,
        );
        wrapper.setState({urlErrors: true});
        expect(wrapper.find('.has-error').length).toEqual(2);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on currentURL', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>,
        );
        wrapper.setState({urlErrors: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onSubmit is called with a valid URL', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>,
        );
        const value = 'urlexample';
        const refURLInput = wrapper.find('input[type="text"]').getDOMNode() as HTMLInputElement;
        refURLInput.value = value;

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onSubmit({preventDefault: () => {}} as React.MouseEvent<HTMLButtonElement>);

        expect(wrapper.state('urlErrors')).toEqual('');
    });

    test('should match state when onSubmit is called with a invalid URL', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>,
        );
        const value = 'a';
        const refURLInput = wrapper.find('input[type="text"]').getDOMNode() as HTMLInputElement;
        refURLInput.value = value;

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onSubmit({preventDefault: () => {}} as React.MouseEvent<HTMLButtonElement>);

        expect((wrapper.state('urlErrors') as JSX.Element[]).length).toEqual(1);
    });

    test('should match state when onURLChanged is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>,
        );
        const value = 'URLEXAMPLE';
        const target = {value};
        const event = {target} as React.ChangeEvent<HTMLInputElement>;

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onURLChanged(event);

        expect(wrapper.state('userEdit')).toEqual(true);
        expect(wrapper.state('currentURL')).toEqual('urlexample');
    });

    test('should match state when onCancel is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>,
        );

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onCancel();

        expect(wrapper.state('urlErrors')).toEqual('');
        expect(wrapper.state('userEdit')).toEqual(false);
    });

    test('should update current url when not editing', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>,
        );

        const url = 'url_1';
        wrapper.setProps({...baseProps, currentURL: url});

        expect(wrapper.state('currentURL')).toEqual(url);
    });

    test('should not update current url when editing', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>,
        );

        const url = 'url_1';
        wrapper.setState({userEdit: true});
        wrapper.setProps({...baseProps, currentURL: url});

        expect(wrapper.state('currentURL')).toEqual('');
    });
});
