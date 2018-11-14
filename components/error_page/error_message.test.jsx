// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ErrorPageTypes} from 'utils/constants.jsx';
import ErrorMessage from 'components/error_page/error_message.jsx';

describe('components/error_page/ErrorMessage', () => {
    const baseProps = {
        type: ErrorPageTypes.LOCAL_STORAGE,
        message: '',
        service: '',
    };

    test('should match snapshot, local_storage type', () => {
        const wrapper = shallow(
            <ErrorMessage {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, permalink_not_found type', () => {
        const props = {...baseProps, type: ErrorPageTypes.PERMALINK_NOT_FOUND};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, oauth_missing_code type', () => {
        const props = {...baseProps, type: ErrorPageTypes.OAUTH_MISSING_CODE, service: 'Gitlab'};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, oauth_access_denied type', () => {
        const props = {...baseProps, type: ErrorPageTypes.OAUTH_ACCESS_DENIED, service: 'Gitlab'};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, page_not_found type', () => {
        const props = {...baseProps, type: ErrorPageTypes.PAGE_NOT_FOUND};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, team_not_found type', () => {
        const props = {...baseProps, type: ErrorPageTypes.TEAM_NOT_FOUND};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel_not_found type', () => {
        const props = {...baseProps, type: ErrorPageTypes.CHANNEL_NOT_FOUND};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, no type but with message', () => {
        const props = {...baseProps, type: '', message: 'error message'};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, no type nor message', () => {
        const props = {...baseProps, type: '', message: ''};
        const wrapper = shallow(
            <ErrorMessage {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
