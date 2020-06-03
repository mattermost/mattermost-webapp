// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import PostDeletedModal from 'components/post_deleted_modal';

describe('components/ChannelInfoModal', () => {
    test('should match snapshot when modal is showing', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <PostDeletedModal
                show={true}
                onHide={emptyFunction}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when modal is not showing', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <PostDeletedModal
                show={false}
                onHide={emptyFunction}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHide callback when modal is hidden', (done) => {
        function onHide() {
            done();
        }

        const wrapper = mountWithIntl(
            <PostDeletedModal
                show={true}
                onHide={onHide}
            />,
        );

        wrapper.find(Modal).first().props().onHide();
    });

    test('shouldComponentUpdate returns the correct results', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <PostDeletedModal
                show={false}
                onHide={emptyFunction}
            />,
        );
        const shouldUpdate = wrapper.instance().shouldComponentUpdate!({show: true}, {}, null);
        expect(shouldUpdate).toBe(true);
    });
});
