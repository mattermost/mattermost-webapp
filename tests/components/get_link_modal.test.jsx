// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import GetLinkModal from 'components/get_link_modal.jsx';

describe('components/GetLinkModal', () => {
    test('should match snapshot when all props is set', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <GetLinkModal
                show={true}
                onHide={emptyFunction}
                title={'title'}
                helpText={'help text'}
                link={'https://mattermost.com'}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when helpText is not set', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <GetLinkModal
                show={true}
                onHide={emptyFunction}
                title={'title'}
                link={'https://mattermost.com'}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called onHide', () => {
        const onHide = jest.fn();

        const wrapper = shallow(
            <GetLinkModal
                show={true}
                onHide={onHide}
                title={'title'}
                link={'https://mattermost.com'}
            />
        );

        wrapper.find(Modal).first().props().onHide();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
