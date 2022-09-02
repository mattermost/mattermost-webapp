// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useReducer} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Subscription} from '@mattermost/types/cloud';
import {PreferenceType} from '@mattermost/types/preferences';
import {getCloudProducts} from 'mattermost-redux/actions/cloud';
import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';
import {ModalData} from 'types/actions';
import {ModalIdentifiers, StoragePrefixes} from 'utils/constants';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import BrowserStore from 'stores/browser_store';

import './deliquency_modal.scss';
import DeliquencyModal from './deliquency_modal';

interface DeliquencyModalControllerProps {
    userIsAdmin: boolean;
    subscription?: Subscription;
    isCloud: boolean;
    actions: {
        getCloudSubscription: () => void;
        closeModal: () => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
    deliquencyModalPreferencesConfirmed: PreferenceType[];
}

const ModalSteps = {
    INITIAL: 'initial',
    CLOSE: 'close',
    TO_SHOW: 'to_show',
    DISPLAYING: 'displaying',
} as const;

type ValueOf<T> = T[keyof T];

const reducerModalStates = (state: ValueOf<typeof ModalSteps>, action: ValueOf<typeof ModalSteps>) => {
    switch (action) {
    case ModalSteps.INITIAL:
    case ModalSteps.CLOSE: {
        return action;
    }
    case ModalSteps.TO_SHOW: {
        if (state !== ModalSteps.INITIAL) {
            return state;
        }

        return action;
    }
    case ModalSteps.DISPLAYING: {
        if (state !== ModalSteps.TO_SHOW) {
            return state;
        }

        return action;
    }
    default: {
        return state;
    }
    }
};

const useDeliquencyModalControllerState = () => {
    const [state, dispatch] = useReducer(reducerModalStates, ModalSteps.INITIAL);

    const setToDisplay = () => {
        dispatch(ModalSteps.TO_SHOW);
    };

    const setModalDisplayed = () => {
        dispatch(ModalSteps.DISPLAYING);
    };

    const setModalClosed = () => {
        dispatch(ModalSteps.CLOSE);
    };

    return {
        state,
        setToDisplay,
        setModalClosed,
        setModalDisplayed,
    };
};

const SESSION_MODAL_ITEM = `${StoragePrefixes.DELIQUENCY}hide_downgrade_modal`;

const DeliquencyModalController = (props: DeliquencyModalControllerProps) => {
    const product = useSelector(getSubscriptionProduct);
    const dispatch = useDispatch();
    const {isCloud, userIsAdmin, subscription, actions, deliquencyModalPreferencesConfirmed} = props;
    const {openModal} = actions;
    const {state, setToDisplay, setModalClosed, setModalDisplayed} = useDeliquencyModalControllerState();

    useEffect(() => {
        if (deliquencyModalPreferencesConfirmed.length === 0 && product == null) {
            dispatch(getCloudProducts());
        }
    }, []);

    useEffect(() => {
        if (deliquencyModalPreferencesConfirmed.length > 0) {
            return;
        }

        if (!isCloud) {
            return;
        }

        if (subscription == null) {
            return;
        }

        const isClosed = Boolean(BrowserStore.getItem(SESSION_MODAL_ITEM, '')) === true;

        if (isClosed) {
            return;
        }

        const delinquencyDate = new Date(
            (subscription.delinquent_since || 0) * 1000,
        );

        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const today = new Date();
        const diffDays = Math.round(
            Math.abs((today.valueOf() - delinquencyDate.valueOf()) / oneDay),
        );
        if (diffDays < 90) {
            return;
        }

        if (!userIsAdmin) {
            return;
        }

        if (state !== ModalSteps.INITIAL) {
            return;
        }

        setToDisplay();
    }, [deliquencyModalPreferencesConfirmed.length, isCloud, openModal, setToDisplay, state, subscription, userIsAdmin]);

    useEffect(() => {
        if (state === ModalSteps.TO_SHOW && product != null) {
            openModal({
                modalId: ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE,
                dialogType: DeliquencyModal,
                dialogProps: {
                    closeModal: actions.closeModal,
                    onExited: setModalClosed,
                    planName: product.name,
                },
            });
            setModalDisplayed();
        }

        if (state === ModalSteps.CLOSE) {
            BrowserStore.setItem(SESSION_MODAL_ITEM, 'true');
        }
    }, [actions.closeModal, openModal, product, props, setModalClosed, setModalDisplayed, state]);

    return <></>;
};

export default withGetCloudSubscription(DeliquencyModalController);
