// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ShowMore from 'components/post_view/show_more';

describe('components/post_view/ShowMore', () => {
    const children = (<div><p>{'text'}</p></div>);
    const baseProps = {
        checkOverflow: false,
        isAttachmentText: false,
        maxHeight: 200,
        text: 'text',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ShowMore {...baseProps}>{children}</ShowMore>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, PostMessageView on collapsed view', () => {
        const wrapper = shallow(<ShowMore {...baseProps}/>);
        wrapper.setState({isOverflow: true, isCollapsed: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, PostMessageView on expanded view', () => {
        const wrapper = shallow(<ShowMore {...baseProps}/>);
        wrapper.setState({isOverflow: true, isCollapsed: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, PostAttachment on collapsed view', () => {
        const wrapper = shallow(
            <ShowMore
                {...baseProps}
                isAttachmentText={true}
            />
        );
        wrapper.setState({isOverflow: true, isCollapsed: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, PostAttachment on expanded view', () => {
        const wrapper = shallow(
            <ShowMore
                {...baseProps}
                isAttachmentText={true}
            />
        );
        wrapper.setState({isOverflow: true, isCollapsed: false});
        expect(wrapper).toMatchSnapshot();
    });
});
