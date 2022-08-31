// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import WorkspaceLimitsPanel from 'components/cloud_usage_modal/workspace_limits_panel';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import useGetHighestThresholdCloudLimit from 'components/common/hooks/useGetHighestThresholdCloudLimit';

import './deliquency_modal.scss';

type FreemiumModalProps = {
    onClose: () => void;
}

type ReactivateFooterProps = {
    onReactivate: () => void;
    onClose: () => void;
    productName: string;
}

const ReactivateFooter = ({onClose, onReactivate, productName}: ReactivateFooterProps) => {
    return (<Modal.Footer className={'DeliquencyModal__footer '}>
        <button
            className={'DeliquencyModal__footer--secondary'}
            id={'inviteMembersButton'}
            onClick={onClose}
        >
            <FormattedMessage
                id='cloud_delinquency.modal.stay_on_freemium'
                defaultMessage='Stay on Freemium'
            />
        </button>

        <button
            className={'DeliquencyModal__footer--primary'}
            id={'inviteMembersButton'}
            onClick={onReactivate}
        >
            <FormattedMessage
                id='cloud_delinquency.modal.update_billing'
                defaultMessage='Re-activate {productName}'
                values={{
                    productName,
                }}
            />
        </button>
    </Modal.Footer>);
};

type NoReactivateFooterProps = Omit<ReactivateFooterProps, 'onReactivate' | 'productName'>;

const NoReactivateFooter = ({onClose}: NoReactivateFooterProps) => {
    return (<Modal.Footer className={'DeliquencyModal__footer '}>
        <button
            className={'DeliquencyModal__footer--primary'}
            id={'inviteMembersButton'}
            onClick={onClose}
        >
            <FormattedMessage
                id='cloud_delinquency.modal.stay_on_freemium_close'
                defaultMessage='Close'
            />
        </button>
    </Modal.Footer>);
};

export const FreemiumModal = ({onClose}: FreemiumModalProps) => {
    const openPurchaseModal = useOpenCloudPurchaseModal({isDelinquencyModal: true});
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    useSelector(getTheme);
    const highestLimit = useGetHighestThresholdCloudLimit(usage, limits);

    const handleReactivate = () => {
        onClose();
        openPurchaseModal({trackingLocation: 'deliquency_modal_freemium_admin'});
    };

    return (
        <>
            <Modal.Header className='DeliquencyModal__header '>
                <FormattedMessage
                    id='cloud_delinquency.modal.workspace_downgraded_freemium_title'
                    defaultMessage='You now have data limits on your plan'
                >
                    {(text) => <h3 className='DeliquencyModal__header__title'>{text}</h3>}
                </FormattedMessage>
                <button
                    id='closeIcon'
                    className='icon icon-close DeliquencyModal__header__close'
                    aria-label='Close'
                    title='Close'
                    onClick={onClose}
                />
            </Modal.Header>
            <Modal.Body className='DeliquencyModal__body__freemium'>
                {highestLimit &&
                    <FormattedMessage
                        id='cloud_delinquency.modal.workspace_downgraded_surpassed'
                        defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
                    >
                        {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
                    </FormattedMessage>
                }

                {!highestLimit &&
                    <FormattedMessage
                        id='cloud_delinquency.modal.workspace_downgraded_freemium'
                        defaultMessage='Cloud starter is restricted to 10,000 message history, 10GB file storage, 10 apps, and 500 board cards.'
                    >
                        {(text) => <p className='DeliquencyModal__body__limits-information'>{text}</p>}
                    </FormattedMessage>}

                <FormattedMessage
                    id='cloud_delinquency.modal.workspace_downgraded_freemium_limits'
                    defaultMessage='Free plan limits'
                >
                    {(text) => <span className='DeliquencyModal__body__subheader'>{text}</span>}
                </FormattedMessage>
                <WorkspaceLimitsPanel
                    showIcons={true}
                    limits={limits}
                    usage={usage}
                />
            </Modal.Body>
            {!highestLimit &&
                <ReactivateFooter
                    productName='Professional'
                    onClose={onClose}
                    onReactivate={handleReactivate}
                />}
            {highestLimit && <NoReactivateFooter onClose={onClose}/> }
        </>
    );
};
