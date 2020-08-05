// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SidebarMenu from './sidebar_menu';

describe('components/sidebar/sidebar_menu', () => {
    const baseProps = {
        id: 'menu_id',
        children: null,
        tooltipText: 'some tooltip text',
        buttonAriaLabel: 'some aria label',
        ariaLabel: 'some other aria label',
        draggingState: {},
        refCallback: jest.fn(),
        onToggle: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarMenu {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should set menu state and set position when menu is toggled', () => {
        const wrapper = shallow<SidebarMenu>(
            <SidebarMenu {...baseProps}/>,
        );

        wrapper.instance().setMenuPosition = jest.fn();

        wrapper.instance().handleMenuToggle(true);
        expect(wrapper.instance().state.isMenuOpen).toEqual(true);
        expect(wrapper.instance().setMenuPosition).toHaveBeenCalled();

        wrapper.instance().handleMenuToggle(false);
        expect(wrapper.instance().state.isMenuOpen).toEqual(false);
        expect(wrapper.instance().setMenuPosition).toHaveBeenCalled();
    });

    test('should call external onToggle when menu is toggled', () => {
        const wrapper = shallow<SidebarMenu>(
            <SidebarMenu {...baseProps}/>,
        );

        wrapper.instance().handleMenuToggle(true);
        expect(baseProps.onToggle).toHaveBeenCalledWith(true);

        wrapper.instance().handleMenuToggle(false);
        expect(baseProps.onToggle).toHaveBeenCalledWith(false);
    });

    test('should not call external onToggle when menu state hasnt changed', () => {
        const wrapper = shallow<SidebarMenu>(
            <SidebarMenu {...baseProps}/>,
        );

        wrapper.instance().handleMenuToggle(true);
        expect(baseProps.onToggle).toHaveBeenCalledWith(true);
        expect(baseProps.onToggle).toHaveBeenCalledTimes(1);

        wrapper.instance().handleMenuToggle(true);
        expect(baseProps.onToggle).toHaveBeenCalledTimes(1);
    });

    test('should set the openUp and width properties correctly based on window and ref information', () => {
        const windowSpy = jest.spyOn(global, 'window' as any, 'get');
        windowSpy.mockImplementation(() => ({
            innerHeight: 456,
        }));

        const wrapper = shallow<SidebarMenu>(
            <SidebarMenu {...baseProps}/>,
        );

        wrapper.instance().menuButtonRef = {
            current: {
                getBoundingClientRect: jest.fn(() => ({
                    top: 20,
                    y: 50,
                })) as any,
            } as any,
        };

        const ref = {
            rect: jest.fn(() => ({
                width: 123,
            })),
        };

        wrapper.instance().refCallback(ref as any);
        expect(wrapper.instance().state.openUp).toEqual(false);
        expect(wrapper.instance().state.width).toEqual(ref.rect().width);

        windowSpy.mockRestore();
    });
});
