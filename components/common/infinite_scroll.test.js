// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {mount} from 'enzyme';

import InfiniteScroll from 'components/common/infinite_scroll.jsx';

describe('/components/common/InfiniteScroll', () => {
    const baseProps = {
        callBack: jest.fn(),
        endOfData: false,
        endOfDataMessage: 'No more items to fetch',
        styleClass: 'signup-team-all',
    };

    test('should match snapshot', () => {
        const wrapper = mount(<InfiniteScroll {...baseProps}><div/></InfiniteScroll>);
        expect(wrapper).toMatchSnapshot();

        const wrapperDiv = wrapper.find(`.${baseProps.styleClass}`);

        // InfiniteScroll is styled by the user's style
        expect(wrapperDiv.exists()).toBe(true);

        // Ensure that scroll is added to InfiniteScroll wrapper div
        expect(wrapperDiv.prop('style')).toHaveProperty('overflowY', 'scroll');
    });
});