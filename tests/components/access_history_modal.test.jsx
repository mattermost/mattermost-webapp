// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import $ from 'jquery';
require('perfect-scrollbar/jquery')($);

import AccessHistoryModal from 'components/access_history_modal/access_history_modal.jsx';
import AuditTable from 'components/audit_table.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

describe('components/AccessHistoryModal', () => {
    const baseProps = {
        onHide: jest.fn(),
        actions: {
            getUserAudits: jest.fn(),
        },
    };

    test('should match snapshot when no audits exist', () => {
        const wrapper = shallow(
            <AccessHistoryModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingScreen).exists()).toBe(true);
        expect(wrapper.find(AuditTable).exists()).toBe(false);
    });

    test('should match snapshot when audits exist', () => {
        const wrapper = shallow(
            <AccessHistoryModal {...baseProps}/>
        );

        wrapper.setState({audits: ['audit1', 'audit2']});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingScreen).exists()).toBe(false);
        expect(wrapper.find(AuditTable).exists()).toBe(true);
    });

    test('should have called actions.getUserAudits when onShow is called', () => {
        const actions = {
            getUserAudits: jest.fn(),
        };
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AccessHistoryModal {...props}/>
        );

        wrapper.instance().onShow();
        expect(actions.getUserAudits).toHaveBeenCalledTimes(2);
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <AccessHistoryModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should match state when onAuditChange is called', () => {
        const wrapper = shallow(
            <AccessHistoryModal {...baseProps}/>
        );

        const newState = {show: true, audits: ['audit1', 'audit2'], moreInfo: 'moreInfo'};
        wrapper.setState(newState);
        wrapper.instance().onAuditChange();
        expect(wrapper.state()).toEqual({...newState, audits: []});
    });
});
