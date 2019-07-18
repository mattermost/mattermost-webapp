// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import InfiniteScroll from 'components/common/infinite_scroll.jsx';

describe('/components/common/InfiniteScroll', () => {
    const baseProps = {
        callBack: jest.fn(),
    };
    test('', () => {
        const wrapper = shallow(<InfiniteScroll {...baseProps}/>);

        // Write proper test
        wrapper.debug();
    });
});