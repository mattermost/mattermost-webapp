// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GetPublicLinkModal from 'components/get_public_link_modal/get_public_link_modal.jsx';

describe('components/GetPublicLinkModal', () => {
    const baseProps = {
        onHide: () => {},
        show: false,
    };

    test('should match snapshot when link is empty', () => {
        const props = {link: '', ...baseProps};
        const wrapper = shallow(
            <GetPublicLinkModal {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when link is undefined', () => {
        const wrapper = shallow(
            <GetPublicLinkModal {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when link is not empty', () => {
        const props = {
            link: 'http://mattermost.com/files/n5bnoaz3e7g93nyipzo1bixdwr/public?h=atw9qQHI1nUPnxo1e48tPspo1Qvwd3kHtJZjysmI5zs',
            ...baseProps
        };
        const wrapper = shallow(
            <GetPublicLinkModal {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
