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

    test('should match snapshot, on urlErrors', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.setState({urlErrors: true});
        expect(wrapper.find('.has-error').length).toEqual(2);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on currentURL', () => {
        const wrapper = shallow(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.setState({urlErrors: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onSubmit is called with a valid URL', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const refURLInput = wrapper.find('input[type="text"]').instance();
        refURLInput.value = 'urlexample';

        wrapper.instance().onSubmit({preventDefault: jest.fn()});

        expect(wrapper.state('urlErrors')).toEqual('');
    });

    test('should match state when onSubmit is called with a invalid URL', () => {
        const value = 'a';
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const refURLInput = wrapper.find('input[type="text"]').instance();
        refURLInput.value = value;

        wrapper.instance().onSubmit({preventDefault: jest.fn()});

        expect(wrapper.state('urlErrors').length).toEqual(1);
    });

    test('should match state when onURLChanged is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const value = 'URLEXAMPLE';
        const target = {value};
        wrapper.instance().onURLChanged({target});

        expect(wrapper.state('userEdit')).toEqual(true);
        expect(wrapper.state('currentURL')).toEqual('urlexample');
    });

    test('should match state when onCancel is called', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        wrapper.instance().onCancel();

        expect(wrapper.state('urlErrors')).toEqual('');
        expect(wrapper.state('userEdit')).toEqual(false);
    });

    test('should match when formatUrlErrors is called with a non specific error', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = 'EXAMPLEURL';

        wrapper.instance().formattedError = jest.fn();
        wrapper.update();

        const returned = wrapper.instance().formatUrlErrors(param);
        expect(returned.length).toEqual(1);
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'change_url.invalidUrl',
            'Invalid URL'
        );
    });

    test('should match when formatUrlErrors is called with a 1 character url', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = 'a';

        wrapper.instance().formattedError = jest.fn();
        wrapper.update();

        const returned = wrapper.instance().formatUrlErrors(param);
        expect(returned.length).toEqual(1);
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'change_url.longer',
            'URL must be two or more characters.'
        );
    });

    test('should match when formatUrlErrors is called with a non alphanumeric start, end and two undescores', () => {
        const wrapper = mountWithIntl(
            <ChangeURLModal {...baseProps}/>
        );
        const param = '_a__';

        wrapper.instance().formattedError = jest.fn();
        wrapper.update();

        const returned = wrapper.instance().formatUrlErrors(param);
        expect(returned.length).toEqual(3);
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'change_url.startWithLetter',
            'URL must start with a letter or number.'
        );
        expect(wrapper.instance().formattedError).toBeCalledWith(
            'change_url.endWithLetter',
            'URL must end with a letter or number.'
        );
        expect(wrapper.instance().formattedError).toBeCalledWith(
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
