// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, mount} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';

import SubMenuModal from 'components/widgets/menu/menu_modals/submenu_modal/submenu_modal.jsx';

global.MutationObserver = class {
    disconnect() {}
    observe() {}
};

describe('components/submenu_modal', () => {
    const baseProps = {
        elements: [
            {
                id: 'A',
                text: 'Text A',
            },
            {
                id: 'B',
                text: 'Text B',
                subMenu: [
                    {
                        id: 'C',
                        text: 'Text C',
                    },
                ],
            },
        ],
        action: jest.fn(),
        onHide: jest.fn(),
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
        await wrapper.find('#A').at(1).simulate('click');
        expect(action).toHaveBeenCalledTimes(1);
        expect(action).toHaveBeenCalledWith('A');
        expect(wrapper.state('show')).toEqual(false);

        wrapper.setState({show: true});
        await wrapper.find('#B').at(1).simulate('click');
        expect(action).toHaveBeenCalledTimes(2);
        expect(action).toHaveBeenCalledWith('B');
        expect(wrapper.state('show')).toEqual(false);

        wrapper.setState({show: true});
        await wrapper.find('#C').at(1).simulate('click');
        expect(action).toHaveBeenCalledTimes(4);
        expect(action).toHaveBeenCalledWith('C');
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
