// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DeleteModalTrigger from 'components/delete_modal_trigger';
import ConfirmModal from 'components/confirm_modal';

describe('components/DeleteModalTrigger', () => {
    test('should throw error when trying to construct DeleteModalTrigger', () => {
        expect(() => {
            new DeleteModalTrigger({onDelete: jest.fn()}); //eslint-disable-line no-new
        }).toThrow(TypeError);
        expect(() => {
            new DeleteModalTrigger({onDelete: jest.fn()}); //eslint-disable-line no-new
        }).toThrow('Can not construct abstract class.');
    });

    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        class ChildModal extends DeleteModalTrigger {
            get triggerTitle() { //eslint-disable-line class-methods-use-this
                return <div>{'trigger title'}</div>;
            }
            get modalTitle() { //eslint-disable-line class-methods-use-this
                return <div>{'modal title'}</div>;
            }
            get modalMessage() { //eslint-disable-line class-methods-use-this
                return <div>{'modal message'}</div>;
            }
            get modalConfirmButton() { //eslint-disable-line class-methods-use-this
                return <button>{'modal confirmation button'}</button>;
            }
        }

        const wrapper = shallow(
            <ChildModal
                onDelete={emptyFunction}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when showDeleteModal is set', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal
                onDelete={emptyFunction}
            />,
        );

        wrapper.setState({showDeleteModal: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called onDelete on confirm', () => {
        const onDelete = jest.fn();

        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal
                onDelete={onDelete}
            />,
        );

        wrapper.find(ConfirmModal).first().props().onConfirm(true);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    test('should match state when handleOpenModal is called', () => {
        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal onDelete={jest.fn()}/>,
        );

        const instance = wrapper.instance() as ChildModal;

        const preventDefault = jest.fn();
        wrapper.setState({showDeleteModal: false});
        instance.handleOpenModal({preventDefault} as any);
        expect(wrapper.state('showDeleteModal')).toEqual(true);
        expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    test('should have called onDelete when handleConfirm is called', () => {
        class ChildModal extends DeleteModalTrigger {}
        const onDelete = jest.fn();
        const wrapper = shallow(
            <ChildModal onDelete={onDelete}/>,
        );

        const instance = wrapper.instance() as ChildModal;
        instance.handleConfirm();
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    test('should match state when handleCancel is called', () => {
        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal onDelete={jest.fn()}/>,
        );

        const instance = wrapper.instance() as ChildModal;
        wrapper.setState({showDeleteModal: true});
        instance.handleCancel();
        expect(wrapper.state('showDeleteModal')).toEqual(false);
    });
});
