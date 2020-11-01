// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ResetStatusModal from 'components/reset_status_modal/reset_status_modal.jsx';

describe('components/ResetStatusModal', () => {
    const autoResetStatus = jest.fn().mockImplementation(
        () => {
            return new Promise((resolve) => {
                process.nextTick(() => resolve({status: 'away'}));
            });
        },
    );
    const baseProps = {
        autoResetPref: '',
        actions: {
            autoResetStatus,
            setStatus: jest.fn(),
            savePreferences: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ResetStatusModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should have match state when onConfirm is called', () => {
        const newSetStatus = jest.fn();
        const newSavePreferences = jest.fn();
        const props = {
            ...baseProps,
            actions: {
                autoResetStatus,
                setStatus: newSetStatus,
                savePreferences: newSavePreferences,
            },
        };
        const wrapper = shallow(
            <ResetStatusModal {...props}/>,
        );
        const currentUserStatus = {
            status: 'away',
            user_id: 'user_id_1',
        };
        const expectedUserStatus = {
            status: 'online',
            user_id: 'user_id_1',
        };

        wrapper.setState({
            show: true,
            currentUserStatus,
        });
        wrapper.instance().onConfirm(false);
        expect(wrapper.state('show')).toEqual(false);
        expect(newSetStatus).toHaveBeenCalledTimes(1);
        expect(newSetStatus).toHaveBeenCalledWith(expectedUserStatus);
        expect(newSavePreferences).not.toHaveBeenCalled();

        wrapper.setState({
            show: true,
            currentUserStatus,
        });
        wrapper.instance().onConfirm(true);
        expect(wrapper.state('show')).toEqual(false);
        expect(newSetStatus).toHaveBeenCalledTimes(2);
        expect(newSetStatus).toHaveBeenCalledWith(expectedUserStatus);
        expect(newSavePreferences).toHaveBeenCalledTimes(1);
        expect(newSavePreferences).toHaveBeenCalledWith(
            'user_id_1',
            [{category: 'auto_reset_manual_status', name: 'user_id_1', user_id: 'user_id_1', value: 'true'}],
        );
    });

    test('should have match state when onCancel is called', () => {
        const newSavePreferences = jest.fn();
        const props = {
            ...baseProps,
            actions: {
                autoResetStatus,
                setStatus: jest.fn(),
                savePreferences: newSavePreferences,
            },
        };
        const wrapper = shallow(
            <ResetStatusModal {...props}/>,
        );
        const currentUserStatus = {
            status: 'away',
            user_id: 'user_id_1',
        };

        wrapper.setState({
            show: true,
            currentUserStatus,
        });
        wrapper.instance().onCancel(false);
        expect(wrapper.state('show')).toEqual(false);
        expect(newSavePreferences).not.toHaveBeenCalled();

        wrapper.setState({
            show: true,
            currentUserStatus,
        });
        wrapper.instance().onCancel(true);
        expect(wrapper.state('show')).toEqual(false);
        expect(newSavePreferences).toHaveBeenCalledTimes(1);
        expect(newSavePreferences).toHaveBeenCalledWith(
            'user_id_1',
            [{category: 'auto_reset_manual_status', name: 'user_id_1', user_id: 'user_id_1', value: 'false'}],
        );
    });

    test('should match snapshot, render modal for OOF status', () => {
        const props = {...baseProps, currentUserStatus: 'ooo'};
        const wrapper = shallow(
            <ResetStatusModal {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
