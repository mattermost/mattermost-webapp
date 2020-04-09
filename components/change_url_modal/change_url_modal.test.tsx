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
            <ChangeURLModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(false);
    });

    test('should match snapshot, modal showing', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).props().show).toEqual(true);
    });

    test('should match snapshot, with a input', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <ChangeURLModal {...props}/>
        );
        const input = wrapper.find('input');
        expect(wrapper).toMatchSnapshot();
        expect(input.length).toEqual(1);
    });

    test('should match snapshot, on urlError', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.setState({urlError: true});
        expect(wrapper.find('.has-error').length).toEqual(2);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on currentURL', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.setState({urlError: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onSubmit is called with a valid URL', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const value = 'urlexample';
        const refURLInput = wrapper.find('input[type="text"]').getDOMNode() as HTMLInputElement;
        refURLInput.value = value;

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onSubmit({preventDefault: () => {}} as React.MouseEvent<HTMLButtonElement>);

        expect(wrapper.state('urlError')).toEqual('');
    });

    test('should match state when onSubmit is called with a invalid URL', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const value = 'a';
        const refURLInput = wrapper.find('input[type="text"]').getDOMNode() as HTMLInputElement;
        refURLInput.value = value;

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onSubmit({preventDefault: () => {}} as React.MouseEvent<HTMLButtonElement>);

        expect((wrapper.state('urlError') as JSX.Element[]).length).toEqual(1);
    });

    test('should match state when onURLChanged is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
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
            <ChangeURLModal {...baseProps}/>
        );

        const instance = wrapper.instance() as ChangeURLModal;
        instance.onCancel();

        expect(wrapper.state('urlError')).toEqual('');
        expect(wrapper.state('userEdit')).toEqual(false);
    });

    test('should match when getURLError is called with a non specific error', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = 'exampleurl';

        const instance = wrapper.instance() as ChangeURLModal;
        instance.formattedError = jest.fn();
        wrapper.update();

        const returned = instance.getURLError(param);
        expect(returned.length).toEqual(1);
        expect(instance.formattedError).toBeCalledWith(
            'errorlast',
            'change_url.invalidUrl',
            'Invalid URL'
        );
    });

    test('should match when getURLError is called with a 1 character url', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = 'a';

        const instance = wrapper.instance() as ChangeURLModal;
        instance.formattedError = jest.fn();
        wrapper.update();

        const returned = instance.getURLError(param);
        expect(returned.length).toEqual(1);
        expect(instance.formattedError).toBeCalledWith(
            'error1',
            'change_url.longer',
            'URL must be two or more characters.'
        );
    });

    test('should match when getURLError is called with a non alphanumeric start, end and two undescores', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = '_a__';

        const instance = wrapper.instance() as ChangeURLModal;
        instance.formattedError = jest.fn();
        wrapper.update();

        const returned = instance.getURLError(param);
        expect(returned.length).toEqual(3);
        expect(instance.formattedError).toBeCalledWith(
            'error2',
            'change_url.startWithLetter',
            'URL must start with a letter or number.'
        );
        expect(instance.formattedError).toBeCalledWith(
            'error3',
            'change_url.endWithLetter',
            'URL must end with a letter or number.'
        );
        expect(instance.formattedError).toBeCalledWith(
            'error4',
            'change_url.noUnderscore',
            'URL can not contain two underscores in a row.'
        );
    });

    test('should update current url when not editing', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );

        const url = 'url_1';
        wrapper.setProps({...baseProps, currentURL: url});

        expect(wrapper.state('currentURL')).toEqual(url);
    });

    test('should not update current url when editing', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );

        const url = 'url_1';
        wrapper.setState({userEdit: true});
        wrapper.setProps({...baseProps, currentURL: url});

        expect(wrapper.state('currentURL')).toEqual('');
    });
});
