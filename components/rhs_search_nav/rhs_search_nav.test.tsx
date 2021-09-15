// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import {RHSStates} from 'utils/constants';

import RHSSearchNav from './rhs_search_nav';

describe('components/RHSSearchNav', () => {
    const baseProps = {
        actions: {
            showFlaggedPosts: jest.fn(),
            showMentions: jest.fn(),
            openRHSSearch: jest.fn(),
            closeRightHandSide: jest.fn(),
            openModal: jest.fn(),
            closeModal: jest.fn(),
        },
    };

    test('should render active flagged posts', () => {
        const props = {
            ...baseProps,
            rhsState: RHSStates.FLAG,
            rhsOpen: true,
            windowWidth: 1600,
            isMobileView: false,
        };

        const wrapper = shallow(
            <RHSSearchNav {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render active mentions posts', () => {
        const props = {
            ...baseProps,
            rhsState: RHSStates.MENTION,
            rhsOpen: true,
            windowWidth: 1600,
            isMobileView: false,
        };

        const wrapper = shallow(
            <RHSSearchNav {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
