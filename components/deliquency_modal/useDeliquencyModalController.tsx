// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {getCloudProducts} from 'mattermost-redux/actions/cloud';
import {Subscription} from '@mattermost/types/cloud';
import {getSubscriptionProduct} from 'mattermost-redux/selectors/entities/cloud';
import {PreferenceType} from '@mattermost/types/preferences';
import BrowserStore from 'stores/browser_store';
import {StoragePrefixes, ModalIdentifiers} from 'utils/constants';
import {ModalData} from 'types/actions';

import DeliquencyModal from './deliquency_modal';
import {ModalStatus, useDeliquencyModalControllerState} from './useDeliquencyModal';

const SESSION_MODAL_ITEM = `${StoragePrefixes.DELIQUENCY}hide_downgrade_modal`;

type UseDeliquencyModalController = {
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

export const useDeliquencyModalController = (props: UseDeliquencyModalController) => {
    const product = useSelector(getSubscriptionProduct);
    const dispatch = useDispatch();
    const {isCloud, userIsAdmin, subscription, actions, deliquencyModalPreferencesConfirmed} = props;
    const {openModal} = actions;
    const {modalState, setToDisplay, setModalClosed, setModalDisplayed, setModalClosing} = useDeliquencyModalControllerState();
    const [requestedProducts, setRequestedProducts] = useState(false);

    useEffect(() => {
        if (deliquencyModalPreferencesConfirmed.length === 0 && product == null && !requestedProducts) {
            dispatch(getCloudProducts());
            setRequestedProducts(true);
        }
    }, []);

    useEffect(() => {
        if (modalState !== ModalStatus.INITIAL) {
            return;
        }

        if (false) {
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

        setToDisplay();
    }, [deliquencyModalPreferencesConfirmed.length, isCloud, openModal, setToDisplay, modalState, subscription, userIsAdmin]);

    useEffect(() => {
        if (modalState === ModalStatus.TO_SHOW && product != null) {
            openModal({
                modalId: ModalIdentifiers.DELIQUENCY_MODAL_DOWNGRADE,
                dialogType: DeliquencyModal,
                dialogProps: {
                    closeModal: actions.closeModal,
                    onExited: setModalClosing,
                    planName: product.name,
                },
            });
            setModalDisplayed();
        }

        if (modalState === ModalStatus.CLOSING) {
            setModalClosed();
            BrowserStore.setItem(SESSION_MODAL_ITEM, 'true');
        }
    }, [actions.closeModal, openModal, product, setModalClosed, setModalDisplayed, modalState, setModalClosing]);
};
