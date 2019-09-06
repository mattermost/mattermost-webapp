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
    const action1 = jest.fn().mockReturnValueOnce();
    const action2 = jest.fn().mockReturnValueOnce();
    const action3 = jest.fn().mockReturnValueOnce();
    const baseProps = {
        elements: [
            {
                id: 'A',
                text: 'Text A',
                action: action1,
            },
            {
                id: 'B',
                text: 'Text B',
                action: action2,
                subMenu: [
                    {
                        id: 'C',
                        text: 'Text C',
                        action: action3,
                    },
                ],
            },
        ],
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
        const props = {
            ...baseProps,
        };
        const wrapper = mount(
            <SubMenuModal {...props}/>
        );

        wrapper.setState({show: true});
        await wrapper.find('#A').at(1).simulate('click');
        expect(action1).toHaveBeenCalledTimes(1);
        expect(wrapper.state('show')).toEqual(false);

        wrapper.setState({show: true});
        await wrapper.find('#B').at(1).simulate('click');
        expect(action2).toHaveBeenCalledTimes(1);
        expect(wrapper.state('show')).toEqual(false);

        wrapper.setState({show: true});
        await wrapper.find('#C').at(1).simulate('click');
        expect(action3).toHaveBeenCalledTimes(1);
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
