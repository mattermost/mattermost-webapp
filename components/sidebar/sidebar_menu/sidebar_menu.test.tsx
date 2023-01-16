// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import SidebarMenu from './sidebar_menu';

describe('components/sidebar/sidebar_menu', () => {
    const baseProps = {
        id: 'menu_id',
        children: null,
        tooltipText: 'some tooltip text',
        buttonAriaLabel: 'some aria label',
        ariaLabel: 'some other aria label',
        draggingState: {},
        isMenuOpen: false,
        onOpenDirectionChange: jest.fn(),
        onToggleMenu: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarMenu {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should set menu state and set position when menu is opened', () => {
        const props = {
            ...baseProps,
            children: [
                <li
                    key='test-item'
                    id='test-item'
                />,
            ],
        };

        const wrapper = shallow<SidebarMenu>(
            <SidebarMenu {...props}/>,
        );

        wrapper.instance().setMenuPosition = jest.fn();

        wrapper.setProps({isMenuOpen: true});
        expect(wrapper.instance().setMenuPosition).toHaveBeenCalledTimes(1);

        wrapper.setProps({isMenuOpen: false});
        expect(wrapper.instance().setMenuPosition).toHaveBeenCalledTimes(1);
    });

    test('should call external onToggle when menu is toggled', () => {
        const wrapper = mount<SidebarMenu>(
            <SidebarMenu {...baseProps}/>,
        );

        wrapper.find('button').simulate('click');
        expect(baseProps.onToggleMenu).toHaveBeenCalledWith(true);

        wrapper.find('button').simulate('click');
        expect(baseProps.onToggleMenu).toHaveBeenCalledWith(false);
    });

    test('should set the openUp and width properties correctly based on window and ref information', () => {
        const windowSpy = jest.spyOn(global, 'window' as any, 'get');
        windowSpy.mockImplementation(() => ({
            innerHeight: 456,
        }));

        const wrapper = shallow<SidebarMenu>(
            <SidebarMenu {...baseProps}/>,
        );

        // The menu should open downwards to start
        wrapper.instance().menuButtonRef = {
            current: {
                getBoundingClientRect: jest.fn(() => ({
                    top: 20,
                    y: 20,
                })) as any,
            } as any,
        };

        wrapper.setProps({
            isMenuOpen: true,
        });

        expect(wrapper.state('openUp')).toBe(false);
        expect(baseProps.onOpenDirectionChange).toHaveBeenCalledTimes(0);

        // And then it should go upwards
        wrapper.instance().menuButtonRef = {
            current: {
                getBoundingClientRect: jest.fn(() => ({
                    top: 400,
                    y: 400,
                })) as any,
            } as any,
        };

        wrapper.setProps({
            isMenuOpen: false,
        });
        wrapper.setProps({
            isMenuOpen: true,
        });

        expect(wrapper.state('openUp')).toBe(true);
        expect(baseProps.onOpenDirectionChange).toHaveBeenCalledTimes(1);
        expect(baseProps.onOpenDirectionChange).toHaveBeenLastCalledWith(true);

        // And finally back downwards again
        wrapper.instance().menuButtonRef = {
            current: {
                getBoundingClientRect: jest.fn(() => ({
                    top: 20,
                    y: 20,
                })) as any,
            } as any,
        };

        wrapper.setProps({
            isMenuOpen: false,
        });
        wrapper.setProps({
            isMenuOpen: true,
        });

        expect(wrapper.state('openUp')).toBe(false);
        expect(baseProps.onOpenDirectionChange).toHaveBeenCalledTimes(2);
        expect(baseProps.onOpenDirectionChange).toHaveBeenLastCalledWith(false);

        windowSpy.mockRestore();
    });
});
