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
        className: 'signup-team-all',
    };
    // const ref = React.createRef().current;
    test('should match snapshot', () => {
        const wrapper = mount(<InfiniteScroll {...baseProps}><div/></InfiniteScroll>);
        expect(wrapper).toMatchSnapshot();
    });
});