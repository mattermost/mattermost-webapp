// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ErrorPageTypes} from 'utils/constants.jsx';

import ErrorPage from 'components/error_page';

describe('components/error_page/ErrorPage', () => {
    const defaultLocation = {
        query: {
            type: ErrorPageTypes.LOCAL_STORAGE,
            title: '',
            message: '',
            service: ''
        }
    };

    test('should match snapshot, local_storage type', () => {
        const wrapper = shallow(
            <ErrorPage location={defaultLocation}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, permalink_not_found type', () => {
        const newLocation = {...defaultLocation};
        newLocation.query.type = ErrorPageTypes.PERMALINK_NOT_FOUND;
        const wrapper = shallow(
            <ErrorPage location={newLocation}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, oauth_missing_code type', () => {
        const newLocation = {...defaultLocation};
        newLocation.query.type = ErrorPageTypes.OAUTH_MISSING_CODE;
        newLocation.query.service = 'Gitlab';
        const wrapper = shallow(
            <ErrorPage location={newLocation}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, page_not_found type', () => {
        const newLocation = {...defaultLocation};
        newLocation.query.type = ErrorPageTypes.PAGE_NOT_FOUND;
        newLocation.query.service = '';

        const wrapper = shallow(
            <ErrorPage location={newLocation}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, no type but with title', () => {
        const newLocation = {...defaultLocation};
        newLocation.query.type = '';
        newLocation.query.title = 'Error Title';

        const wrapper = shallow(
            <ErrorPage location={newLocation}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
