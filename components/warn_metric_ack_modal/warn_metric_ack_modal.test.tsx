// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Modal} from 'react-bootstrap';
import {UserProfile} from 'mattermost-redux/src/types/users';

import WarnMetricAckModal from 'components/warn_metric_ack_modal/warn_metric_ack_modal';

jest.mock('react-dom', () => ({
    findDOMNode: () => ({
        blur: jest.fn(),
    }),
}));

describe('components/WarnMetricAckModal', () => {
    const gettingTrialError = 'some error';

    const baseProps = {
        stats: {
            registered_users: 200,
        },
        user: {
            id: 'someUserId',
            first_name: 'Fake',
            last_name: 'Person',
            email: 'a@test.com',
        } as UserProfile,
        show: false,
        diagnosticId: 'diag_0',
        closeParentComponent: jest.fn(),
        warnMetricStatus: {
            id: 'metric1',
            aae_id: 'aae_id',
            limit: 500,
        },
        actions: {
            closeModal: jest.fn(),
            getStandardAnalytics: jest.fn(),
            requestTrialLicenseAndAckWarnMetric: jest.fn(),
            getLicenseConfig: jest.fn()
        },
    };

    test('should match snapshot, init', () => {
        const wrapper = shallow<WarnMetricAckModal>(
            <WarnMetricAckModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('error display', () => {
        const wrapper = shallow<WarnMetricAckModal>(
            <WarnMetricAckModal {...baseProps}/>,
        );

        wrapper.setState({gettingTrialError});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow<WarnMetricAckModal>(
            <WarnMetricAckModal {...baseProps}/>,
        );

        wrapper.setState({gettingTrial: true});
        wrapper.instance().onHide();
        expect(wrapper.state('gettingTrial')).toEqual(false);
    });

    test('should match state when onHideWithParent is called', () => {
        const wrapper = shallow<WarnMetricAckModal>(
            <WarnMetricAckModal {...baseProps}/>,
        );

        wrapper.setState({gettingTrial: true});
        wrapper.instance().onHideWithParent();

        expect(baseProps.closeParentComponent).toHaveBeenCalledTimes(1);
        expect(wrapper.state('gettingTrial')).toEqual(false);
    });

    test('send ack on acknowledge button click', () => {
        const wrapper = shallow<WarnMetricAckModal>(
            <WarnMetricAckModal {...baseProps}/>,
        );

        wrapper.setState({gettingTrial: true});
        wrapper.find('button').simulate('click');
        expect(baseProps.actions.requestTrialLicenseAndAckWarnMetric).toHaveBeenCalledTimes(1);
    });

    test('should have called props.onHide when Modal.onExited is called', () => {
        const props = {...baseProps};
        const wrapper = shallow(
            <WarnMetricAckModal {...props}/>,
        );

        wrapper.find(Modal).props().onExited!(document.createElement('div'));
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
    });
});