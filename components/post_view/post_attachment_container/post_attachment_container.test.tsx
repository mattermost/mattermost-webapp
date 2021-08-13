// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';

import React from 'react';

import PostAttachmentContainer, {Props} from './post_attachment_container';

describe('PostAttachmentContainer', () => {
    const baseProps: Props = {
        children: <p>{'some children'}</p>,
        className: 'permalink',
        link: '#',
    };
    test('should render correctly', () => {
        const wrapper = shallow(<PostAttachmentContainer {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
