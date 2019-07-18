// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';

import SubMenuModal from 'components/submenu_modal/submenu_modal.jsx';

describe('components/submenu_modal', () => {
    const baseProps = {
        elements: [
            {
                id: 'A',
                text: 'A',
            },
            {
                id: 'B',
                text: 'B',
                subMenu: [
                    {
                        id: 'C',
                        text: 'C',
                    },
                ],
            },
        ],
        action: jest.fn(),
        onHide: jest.fn(),
        openModal: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SubMenuModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <SubMenuModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called click function when button is clicked', async () => {
        browserHistory.push = jest.fn();
        const action = jest.fn().mockReturnValueOnce();
        const props = {
            ...baseProps,
            action,
        };
        const wrapper = mount(
            <SubMenuModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.find('#A').at(1).simulate('click');
        await expect(action).toHaveBeenCalledTimes(1);
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <SubMenuModal {...props}/>
        );

        wrapper.find(Modal).props().onExited();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
