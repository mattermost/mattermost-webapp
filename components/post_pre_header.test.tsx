// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import PostPreHeader from 'components/post_pre_header';
import FlagIconFilled from 'components/widgets/icons/flag_icon_filled';

describe('components/PostPreHeader', () => {
    test('should not render anything if the post is neither flagged nor pinned', () => {
        const props = {
            isFlagged: false,
            isPinned: false,
        };

        const wrapper = shallowWithIntl(
            <PostPreHeader {...props}/>
        );

        expect(wrapper.find('div')).toHaveLength(0);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render anything if both skipFlagged and skipPinned are true', () => {
        const props = {
            isFlagged: true,
            isPinned: true,
            skipFlagged: true,
            skipPinned: true
        };

        const wrapper = shallowWithIntl(
            <PostPreHeader {...props}/>
        );

        expect(wrapper.find('div')).toHaveLength(0);
        expect(wrapper).toMatchSnapshot();
    });

    test('should properly handle flagged posts (and not pinned)', () => {
        const props = {
            isFlagged: true,
            isPinned: false,
        };

        const wrapper = shallowWithIntl(
            <PostPreHeader {...props}/>
        );

        expect(wrapper.find('span.icon-pin')).toHaveLength(0);

        expect(wrapper.find(FlagIconFilled)).toHaveLength(1);
        expect(wrapper.find(FormattedMessage)).toHaveLength(1);
        expect(wrapper.find(FormattedMessage).prop('defaultMessage')).toEqual('Flagged');
        expect(wrapper).toMatchSnapshot();

        // case of skipFlagged is true
        wrapper.setProps({...props, skipFlagged: true});

        expect(wrapper.find(FlagIconFilled)).toHaveLength(0);
        expect(wrapper.find(FormattedMessage)).toHaveLength(0);
        expect(wrapper).toMatchSnapshot();
    });

    test('should properly handle pinned posts (and not flagged)', () => {
        const props = {
            isFlagged: false,
            isPinned: true,
        };

        const wrapper = shallowWithIntl(
            <PostPreHeader {...props}/>
        );

        expect(wrapper.find(FlagIconFilled)).toHaveLength(0);

        expect(wrapper.find('span.icon-pin')).toHaveLength(1);
        expect(wrapper.find(FormattedMessage)).toHaveLength(1);
        expect(wrapper.find(FormattedMessage).prop('defaultMessage')).toEqual('Pinned');
        expect(wrapper).toMatchSnapshot();

        // case of skipPinned is true
        wrapper.setProps({...props, skipPinned: true});

        expect(wrapper.find('span.icon-pin')).toHaveLength(0);
        expect(wrapper.find(FormattedMessage)).toHaveLength(0);
        expect(wrapper).toMatchSnapshot();
    });

    describe('should properly handle posts that are flagged and pinned', () => {
        test('both skipFlagged and skipPinned are not true', () => {
            const props = {
                isFlagged: true,
                isPinned: true,
            };

            const wrapper = shallowWithIntl(
                <PostPreHeader {...props}/>
            );

            expect(wrapper.find(FlagIconFilled)).toHaveLength(1);
            expect(wrapper.find('span.icon-pin')).toHaveLength(1);
            expect(wrapper.find(FormattedMessage)).toHaveLength(1);
            expect(wrapper.find(FormattedMessage).prop('defaultMessage')).toEqual('Pinned and Flagged');
            expect(wrapper).toMatchSnapshot();
        });

        test('skipFlagged is true', () => {
            const props = {
                isFlagged: true,
                isPinned: true,
                skipFlagged: true,
            };

            const wrapper = shallowWithIntl(
                <PostPreHeader {...props}/>
            );

            expect(wrapper.find(FlagIconFilled)).toHaveLength(0);

            expect(wrapper.find('span.icon-pin')).toHaveLength(1);
            expect(wrapper.find(FormattedMessage)).toHaveLength(1);
            expect(wrapper.find(FormattedMessage).prop('defaultMessage')).toEqual('Pinned');
            expect(wrapper).toMatchSnapshot();
        });

        test('skipPinned is true', () => {
            const props = {
                isFlagged: true,
                isPinned: true,
                skipPinned: true,
            };

            const wrapper = shallowWithIntl(
                <PostPreHeader {...props}/>
            );

            expect(wrapper.find('span.icon-pin')).toHaveLength(0);

            expect(wrapper.find(FlagIconFilled)).toHaveLength(1);
            expect(wrapper.find(FormattedMessage)).toHaveLength(1);
            expect(wrapper.find(FormattedMessage).prop('defaultMessage')).toEqual('Flagged');
            expect(wrapper).toMatchSnapshot();
        });
    });
});
