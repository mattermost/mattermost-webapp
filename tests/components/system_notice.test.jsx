// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import mattermostIcon from 'images/icon50x50.png';

import SystemNotice from 'components/system_notice/system_notice.jsx';

describe('components/SystemNotice', () => {
    const baseProps = {
        currentUserId: 'someid',
        preferences: {},
        dismissedNotices: {},
        isSystemAdmin: false,
        notices: [{name: 'notice1', adminOnly: false, title: 'some title', icon: mattermostIcon, body: 'some body'}],
        actions: {
            savePreferences: jest.fn(),
            dismissNotice: jest.fn(),
        },
    };

    test('should match snapshot for regular user, regular notice', () => {
        const wrapper = shallow(<SystemNotice {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for regular user, no notice', () => {
        const props = {...baseProps, notices: []};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for regular user, admin notice', () => {
        const props = {...baseProps, notices: [{name: 'notice1', adminOnly: true, title: 'some title', icon: mattermostIcon, body: 'some body'}]};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for regular user, admin and regular notice', () => {
        const props = {...baseProps, notices: [{name: 'notice1', adminOnly: true, title: 'some title', icon: mattermostIcon, body: 'some body'}, {name: 'notice2', adminOnly: false, title: 'some title2', icon: mattermostIcon, body: 'some body2'}]};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for admin, regular notice', () => {
        const props = {...baseProps, isSystemAdmin: true};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for admin, admin notice', () => {
        const props = {...baseProps, isSystemAdmin: true, notices: [{name: 'notice1', adminOnly: true, title: 'some title', icon: mattermostIcon, body: 'some body'}]};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for regular user, dismissed notice', () => {
        const props = {...baseProps, dismissedNotices: {notice1: true}};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for regular user, dont show again notice', () => {
        const props = {...baseProps, preferences: {notice1: {}}};
        const wrapper = shallow(<SystemNotice {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
