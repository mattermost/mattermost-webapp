// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl, MessageDescriptor} from 'react-intl';
import classNames from 'classnames';

import FeatureRestrictedModal from 'components/feature_restricted_modal/feature_restricted_modal';
import OverlayTrigger from 'components/overlay_trigger';
import ToggleModalButton from 'components/toggle_modal_button';
import Tooltip from 'components/tooltip';

import {FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS} from 'utils/cloud_utils';
import {Constants, ModalIdentifiers} from 'utils/constants';

import './restricted_indicator.scss';

type RestrictedIndicatorProps = {
    useModal?: boolean;
    titleAdminPreTrial?: string;
    messageAdminPreTrial?: string;
    titleAdminPostTrial?: string;
    messageAdminPostTrial?: string;
    titleEndUser?: string;
    messageEndUser?: string;
    blocked?: boolean;
    tooltipTitle?: string;
    tooltipMessage?: string;
    tooltipMessageBlocked?: string | MessageDescriptor;
    ctaExtraContent?: React.ReactNode;
    clickCallback?: () => void;
    customSecondaryButtonInModal?: {msg: string; action: () => void};
    feature?: string;
    minimumPlanRequiredForFeature?: string;
}

const RestrictedIndicator = ({
    useModal = true,
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
    ctaExtraContent,
    clickCallback,
    customSecondaryButtonInModal,
    feature,
    minimumPlanRequiredForFeature,
}: RestrictedIndicatorProps) => {
    const {formatMessage} = useIntl();

    const getTooltipMessageBlocked = useCallback(() => {
        if (!tooltipMessageBlocked) {
            return formatMessage(
                {
                    id: 'restricted_indicator.tooltip.message.blocked',
                    defaultMessage: 'This is a professional feature, available with a free {trialLength}-day trial',
                }, {
                    trialLength: FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS,
                },
            );
        }

        return typeof tooltipMessageBlocked === 'string' ? tooltipMessageBlocked : formatMessage(tooltipMessageBlocked, {trialLength: FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS});
    }, [tooltipMessageBlocked]);

    const icon = <i className={classNames('RestrictedIndicator__icon-tooltip', 'icon', blocked ? 'icon-key-variant' : 'trial')}/>;

    const handleClickCallback = () => {
        if (clickCallback) {
            clickCallback();
        }
    };

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
                                getTooltipMessageBlocked()
                            ) : (
                                tooltipMessage || formatMessage({id: 'restricted_indicator.tooltip.mesage', defaultMessage: 'During your trial you are able to use this feature.'})
                            )}
                        </span>
                    </Tooltip>
                )}
            >
                {useModal && blocked ? (
                    <ToggleModalButton
                        className='RestrictedIndicator__button'
                        modalId={ModalIdentifiers.FEATURE_RESTRICTED_MODAL}
                        dialogType={FeatureRestrictedModal}
                        onClick={handleClickCallback}
                        dialogProps={{
                            titleAdminPreTrial,
                            messageAdminPreTrial,
                            titleAdminPostTrial,
                            messageAdminPostTrial,
                            titleEndUser,
                            messageEndUser,
                            customSecondaryButton: customSecondaryButtonInModal,
                            feature,
                            minimumPlanRequiredForFeature,
                        }}
                    >
                        {icon}
                        {ctaExtraContent}
                    </ToggleModalButton>
                ) : (
                    <div className='RestrictedIndicator__content'>
                        {icon}
                        {ctaExtraContent}
                    </div>
                )}
            </OverlayTrigger>
        </span>
    );
};

export default RestrictedIndicator;
