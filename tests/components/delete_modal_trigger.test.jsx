// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';

import DeleteModalTrigger from 'components/delete_modal_trigger.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

describe('components/DeleteModalTrigger', () => {
    test('should throw error when trying to construct DeleteModalTrigger', () => {
        expect(() => {
            new DeleteModalTrigger(); //eslint-disable-line no-new
        }).toThrow(TypeError);
        expect(() => {
            new DeleteModalTrigger(); //eslint-disable-line no-new
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
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when showDeleteModal is set', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal
                onDelete={emptyFunction}
            />
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
            />
        );

        wrapper.find(ConfirmModal).first().props().onConfirm();
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    test('should have called onDelete on enter key down', () => {
        const onDelete = jest.fn();

        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal
                onDelete={onDelete}
            />
        );

        wrapper.find(ConfirmModal).first().props().onKeyDown({keyCode: Constants.KeyCodes.ENTER});
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    test('should not called onDelete on not enter key down', () => {
        const onDelete = jest.fn();

        class ChildModal extends DeleteModalTrigger {}

        const wrapper = shallow(
            <ChildModal
                onDelete={onDelete}
            />
        );

        wrapper.find(ConfirmModal).first().props().onKeyDown({keyCode: Constants.KeyCodes.TAB});
        expect(onDelete).not.toHaveBeenCalled();
    });
});
