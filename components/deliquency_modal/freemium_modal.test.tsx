// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {fireEvent, screen} from '@testing-library/react';
import * as reactRedux from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';
import {trackEvent} from 'actions/telemetry_actions';
import configureStore from 'store';
import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import useGetHighestThresholdCloudLimit, {LimitTypes} from 'components/common/hooks/useGetHighestThresholdCloudLimit';

import {FreemiumModal} from './freemium_modal';

type RenderComponentArgs = {
    props?: Partial<ComponentProps<typeof FreemiumModal>>;
    store?: any;
}

jest.mock('actions/telemetry_actions', () => ({
    trackEvent: jest.fn(),
}));

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn().mockReturnValue(() => {}),
}));

jest.mock('components/common/hooks/useGetHighestThresholdCloudLimit');

describe('components/deliquency_modal/deliquency_modal', () => {
    const initialStates = {
        views: {
            modals: {
                modalState: {
                    [ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE]: {
                        open: true,
                        dialogProps: {
                            planName: 'plan_name',
                            onExited: () => {},
                            closeModal: () => {},
                            isAdminConsole: false,
                        },
                        dialogType: React.Fragment,
                    },
                },
                showLaunchingWorkspace: false,
            },
        },
        entities: {
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin', id: 'test'},
                },
            },
        },
    };

    const renderComponent = ({props = {}, store = configureStore(initialStates)}: RenderComponentArgs) => {
        const defaultProps: ComponentProps<typeof FreemiumModal> = {
            onClose: jest.fn(),
            planName: 'planName',
            isAdminConsole: false,
            onExited: jest.fn(),
        };

        return renderWithIntl(
            <reactRedux.Provider store={store}>
                <FreemiumModal
                    {...defaultProps}
                    {...props}
                />
            </reactRedux.Provider>,
        );
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should track reactivate plan if admin click Re activate plan', () => {
        const planName = 'Testing';
        (useGetHighestThresholdCloudLimit as jest.Mock).mockReturnValue({
            id: LimitTypes.fileStorage,
            limit: 10,
            usage: 12,
        });
        renderComponent({
            props: {
                planName,
            },
        });

        fireEvent.click(screen.getByText(`Re-activate ${planName}`));

        expect(trackEvent).toBeCalledTimes(2);
        expect(trackEvent).toHaveBeenNthCalledWith(1, TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'clicked_re_activate_plan');
        expect(trackEvent).toHaveBeenNthCalledWith(2, TELEMETRY_CATEGORIES.CLOUD_ADMIN, 'click_open_delinquency_modal', {
            callerInfo: 'deliquency_modal_freemium_admin',
        });
    });

    it('should not show reactivate plan if admin limits isn\'t surpassed', () => {
        const planName = 'Testing';
        (useGetHighestThresholdCloudLimit as jest.Mock).mockReturnValue(false);
        renderComponent({
            props: {
                planName,
            },
        });

        expect(screen.queryByText(`Re-activate ${planName}`)).not.toBeInTheDocument();

        expect(trackEvent).toBeCalledTimes(0);
    });
});
