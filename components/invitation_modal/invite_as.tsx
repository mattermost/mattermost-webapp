// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import {GlobalState} from 'types/store';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getSubscriptionProduct, checkHadPriorTrial} from 'mattermost-redux/selectors/entities/cloud';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {closeModal, openModal} from 'actions/views/modals';

import RadioGroup from 'components/common/radio_group';
import RestrictedIndicator from 'components/widgets/menu/menu_items/restricted_indicator';

import {CloudProducts, ModalIdentifiers, NonAdminPaidFeatures} from 'utils/constants';

import {FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS} from 'utils/cloud_utils';

import InvitationModal from 'components/invitation_modal';
import './invite_as.scss';

export const InviteType = {
    MEMBER: 'MEMBER',
    GUEST: 'GUEST',
} as const;

export type InviteType = typeof InviteType[keyof typeof InviteType];

export type Props = {
    setInviteAs: (inviteType: InviteType) => void;
    inviteType: InviteType;
    titleClass?: string;
}

export default function InviteAs(props: Props) {
    const {formatMessage} = useIntl();
    const license = useSelector(getLicense);
    const dispatch = useDispatch<DispatchFunc>();
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const subscriptionProduct = useSelector(getSubscriptionProduct);

    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);
    const isStarter = subscriptionProduct?.sku === CloudProducts.STARTER;

    let extraGuestLegend = true;
    let guestDisabledClass = '';
    let badges = null;
    let guestDisabled = null;

    const isCloud = license?.Cloud === 'true';
    const isCloudFreeTrial = subscription?.is_free_trial === 'true';
    const hasPriorTrial = useSelector(checkHadPriorTrial);

    const isPaidSubscription = isCloud && !isStarter && !isCloudFreeTrial;

    // show the badge logic (the restricted indicator takes care of the look when it is trial or not)
    if (isSystemAdmin && isCloud && !isPaidSubscription) {
        const closeInviteModal = () => {
            dispatch(closeModal(ModalIdentifiers.INVITATION));
        };

        let ctaExtraContentMsg = '';
        if (isCloudFreeTrial) {
            ctaExtraContentMsg = formatMessage({id: 'cloud_free.professional_feature.professional', defaultMessage: 'Professional feature'});
        } else {
            ctaExtraContentMsg = hasPriorTrial ? formatMessage({id: 'cloud_free.professional_feature.upgrade', defaultMessage: 'Upgrade'}) : formatMessage({id: 'cloud_free.professional_feature.try_free', defaultMessage: 'Professional feature- try it out free'});
        }

        const restrictedIndicator = (
            <RestrictedIndicator
                blocked={!isCloudFreeTrial}
                feature={NonAdminPaidFeatures.GUEST_ACCOUNTS}
                minimumPlanRequiredForFeature={CloudProducts.PROFESSIONAL}
                titleAdminPreTrial={formatMessage({
                    id: 'invite_modal.restricted_invite_guest.pre_trial_title',
                    defaultMessage: 'Try inviting guests with a free trial',
                })}
                messageAdminPreTrial={formatMessage({
                    id: 'invite_modal.restricted_invite_guest.pre_trial_description',
                    defaultMessage: 'Collaborate with users outside of your organization while tightly controlling their access to channels and team members. Get the full experience of Enterprise when you start a free, {trialLength} day trial.',
                },
                {trialLength: FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS},
                )}
                titleAdminPostTrial={formatMessage({
                    id: 'invite_modal.restricted_invite_guest.post_trial_title',
                    defaultMessage: 'Upgrade to invite guest',
                })}
                messageAdminPostTrial={formatMessage({
                    id: 'invite_modal.restricted_invite_guest.post_trial_description',
                    defaultMessage: 'Collaborate with users outside of your organization while tightly controlling their access to channels and team members. Upgrade to the Professional plan to create unlimited user groups.',
                })}
                ctaExtraContent={(
                    <span className='badge-text'>
                        {ctaExtraContentMsg}
                    </span>
                )}
                clickCallback={closeInviteModal}
                tooltipMessage={hasPriorTrial ? formatMessage({id: 'cloud_free.professional_feature.upgrade', defaultMessage: 'Upgrade'}) : undefined}

                // the secondary back button first closes the restridted feature modal and then opens back the invitation modal
                customSecondaryButtonInModal={hasPriorTrial ? undefined : {
                    msg: formatMessage({id: 'cloud_free.professional_feature.back', defaultMessage: 'Back'}),
                    action: () => {
                        dispatch(closeModal(ModalIdentifiers.FEATURE_RESTRICTED_MODAL));
                        dispatch(openModal({
                            modalId: ModalIdentifiers.INVITATION,
                            dialogType: InvitationModal,
                        }));
                    },
                }}
            />
        );
        guestDisabledClass = isCloudFreeTrial ? '' : 'disabled-legend';
        badges = {
            matchVal: InviteType.GUEST as string,
            badgeContent: restrictedIndicator,
            extraClass: 'Badge__restricted-indicator-badge',
        };
        extraGuestLegend = false;
    }

    // disable the radio button logic (is disabled when is cloud starter - pre and post trial)
    if (isCloud && isStarter) {
        guestDisabled = (id: string) => {
            return (id === InviteType.GUEST);
        };
    }

    return (
        <div className='InviteAs'>
            <div className={props.titleClass}>
                <FormattedMessage
                    id='invite_modal.as'
                    defaultMessage='Invite as'
                />
            </div>
            <div>
                <RadioGroup
                    onChange={(e) => props.setInviteAs(e.target.value as InviteType)}
                    value={props.inviteType}
                    id='invite-as'
                    values={[
                        {
                            key: (
                                <FormattedMessage
                                    id='invite_modal.choose_member'
                                    defaultMessage='Member'
                                />
                            ),
                            value: InviteType.MEMBER,
                            testId: 'inviteMembersLink',
                        },
                        {
                            key: (
                                <span className={`InviteAs__label ${guestDisabledClass}`}>
                                    <FormattedMessage
                                        id='invite_modal.choose_guest_a'
                                        defaultMessage='Guest'
                                    />
                                    {extraGuestLegend && <span className='InviteAs__label--parenthetical'>
                                        {' - '}
                                        <FormattedMessage
                                            id='invite_modal.choose_guest_b'
                                            defaultMessage='limited to select channels and teams'
                                        />
                                    </span>}
                                </span>
                            ),
                            value: InviteType.GUEST,
                            testId: 'inviteGuestLink',
                        },
                    ]}
                    isDisabled={guestDisabled}
                    badge={badges}
                />
            </div>
        </div>
    );
}
