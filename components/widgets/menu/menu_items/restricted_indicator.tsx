// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import FeatureRestrictedModal from 'components/feature_restricted_modal/feature_restricted_modal';
import OverlayTrigger from 'components/overlay_trigger';
import ToggleModalButton from 'components/toggle_modal_button';
import Tooltip from 'components/tooltip';

import {Constants, ModalIdentifiers} from 'utils/constants';

import './restricted_indicator.scss';

type RestrictedIndicatorProps = {
    blocked?: boolean;
    tooltipTitle?: string;
    tooltipMessage?: string;
    tooltipMessageBlocked?: string;
    titleAdminPreTrial: string;
    messageAdminPreTrial: string;
    titleAdminPostTrial: string;
    messageAdminPostTrial: string;
    titleEndUser: string;
    messageEndUser: string;
}

const RestrictedIndicator = ({
    blocked,
    tooltipTitle,
    tooltipMessage,
    tooltipMessageBlocked,
    titleAdminPreTrial,
    messageAdminPreTrial,
    titleAdminPostTrial,
    messageAdminPostTrial,
    titleEndUser,
    messageEndUser,
}: RestrictedIndicatorProps) => {
    const {formatMessage} = useIntl();

    return (
        <span className='RestrictedIndicator__icon-tooltip-container'>
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='right'
                overlay={(
                    <Tooltip className='RestrictedIndicator__icon-tooltip'>
                        <span className='title'>
                            {tooltipTitle || formatMessage({id: 'restricted_indicator.tooltip.title', defaultMessage: 'Professional feature'})}
                        </span>
                        <span className='message'>
                            {blocked ? (
                                tooltipMessageBlocked || formatMessage({id: 'restricted_indicator.tooltip.message.blocked', defaultMessage: 'This is a paid feature, available with a free 30-day trial'})
                            ) : (
                                tooltipMessage || formatMessage({id: 'restricted_indicator.tooltip.mesage', defaultMessage: 'During your trial you are able to use this feature.'})
                            )}
                        </span>
                    </Tooltip>
                )}
            >
                {blocked ? (
                    <ToggleModalButton
                        className='RestrictedIndicator__button'
                        modalId={ModalIdentifiers.FEATURE_RESTRICTED_MODAL}
                        dialogType={FeatureRestrictedModal}
                        dialogProps={{
                            titleAdminPreTrial,
                            messageAdminPreTrial,
                            titleAdminPostTrial,
                            messageAdminPostTrial,
                            titleEndUser,
                            messageEndUser,
                        }}
                    >
                        <i className='RestrictedIndicator__icon-tooltip icon icon-key-variant'/>
                    </ToggleModalButton>
                ) : (
                    <i className='RestrictedIndicator__icon-tooltip icon trial'/>
                )}
            </OverlayTrigger>
        </span>
    );
};

export default RestrictedIndicator;
