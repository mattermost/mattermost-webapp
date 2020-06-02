// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GetPublicLinkModal from 'components/get_public_link_modal/get_public_link_modal.jsx';
import GetLinkModal from 'components/get_link_modal';

describe('components/GetPublicLinkModal', () => {
    test('should match snapshot when link is empty', () => {
        const wrapper = shallow(
            <GetPublicLinkModal
                link={''}
                actions={{getFilePublicLink: jest.fn()}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when link is undefined', () => {
        const wrapper = shallow(
            <GetPublicLinkModal
                actions={{getFilePublicLink: jest.fn()}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when link is not empty', () => {
        const wrapper = shallow(
            <GetPublicLinkModal
                link={'http://mattermost.com/files/n5bnoaz3e7g93nyipzo1bixdwr/public?h=atw9qQHI1nUPnxo1e48tPspo1Qvwd3kHtJZjysmI5zs'}
                actions={{getFilePublicLink: jest.fn()}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call getFilePublicLink on GetPublicLinkModal\'s show', () => {
        const getFilePublicLink = jest.fn();
        const fileId = 'n5bnoaz3e7g93nyipzo1bixdwr';

        const wrapper = shallow(
            <GetPublicLinkModal
                link={'http://mattermost.com/files/n5bnoaz3e7g93nyipzo1bixdwr/public?h=atw9qQHI1nUPnxo1e48tPspo1Qvwd3kHtJZjysmI5zs'}
                actions={{getFilePublicLink}}
            />,
        );

        wrapper.setState({show: true, fileId});
        expect(getFilePublicLink).toHaveBeenCalledTimes(1);
        expect(getFilePublicLink).toHaveBeenCalledWith(fileId);
    });

    test('should not call getFilePublicLink on GetLinkModal\'s onHide', () => {
        const getFilePublicLink = jest.fn();
        const fileId = 'n5bnoaz3e7g93nyipzo1bixdwr';

        const wrapper = shallow(
            <GetPublicLinkModal
                link={'http://mattermost.com/files/n5bnoaz3e7g93nyipzo1bixdwr/public?h=atw9qQHI1nUPnxo1e48tPspo1Qvwd3kHtJZjysmI5zs'}
                actions={{getFilePublicLink}}
            />,
        );

        wrapper.setState({show: true, fileId});
        getFilePublicLink.mockClear();
        wrapper.find(GetLinkModal).first().props().onHide();
        expect(getFilePublicLink).not.toHaveBeenCalled();
    });

    test('should call handleToggle on GetLinkModal\'s onHide', () => {
        const wrapper = shallow(
            <GetPublicLinkModal
                link={'http://mattermost.com/files/n5bnoaz3e7g93nyipzo1bixdwr/public?h=atw9qQHI1nUPnxo1e48tPspo1Qvwd3kHtJZjysmI5zs'}
                actions={{getFilePublicLink: jest.fn()}}
            />,
        );

        wrapper.find(GetLinkModal).first().props().onHide();
        expect(wrapper.state('show')).toBe(false);
    });
});
