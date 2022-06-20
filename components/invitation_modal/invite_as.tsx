// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {FormattedMessage, useIntl} from 'react-intl';

import {GlobalState} from 'types/store';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {LicenseSkus} from 'mattermost-redux/types/general';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {closeModal} from 'actions/views/modals';

import RadioGroup from 'components/common/radio_group';
import RestrictedIndicator from 'components/widgets/menu/menu_items/restricted_indicator';

import {ModalIdentifiers} from 'utils/constants';

import {FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS} from 'utils/cloud_utils';

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
    const isSystemAdmin = useSelector(isCurrentUserSystemAdmin);

    let extraGuestLegend = true;
    let guestDisabledClass = '';
    let badges = null;
    let guestDisabled = null;

    const isCloud = license?.Cloud === 'true';
    const isCloudFreeTrial = subscription?.is_free_trial === 'true';

    const isPaidSubscription = isCloud && license?.SkuShortName !== LicenseSkus.Starter && !isCloudFreeTrial;

    const closeInviteModal = () => {
        dispatch(closeModal(ModalIdentifiers.INVITATION));
    };

    const restrictedIndicator = (
        <RestrictedIndicator
            blocked={!isCloudFreeTrial}
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
                    {isCloudFreeTrial ? formatMessage({id: 'cloud_free.professional_feature.professional', defaultMessage: 'Professional feature'}) : formatMessage({id: 'cloud_free.professional_feature.try_free', defaultMessage: 'Professional feature- try it out free'})}
                </span>
            )}
            clickCallback={closeInviteModal}
        />
    );

    // show the badge logic (the restricted indicator takes care of the look when it is trial or not)
    if (isSystemAdmin && isCloud && !isCloudFreeTrial && !isPaidSubscription) {
        guestDisabledClass = 'disabled-legend';
        badges = {
            matchVal: InviteType.GUEST as string,
            badgeContent: restrictedIndicator,
            extraClass: 'restricted-indicator-badge',
        };
        extraGuestLegend = false;
    }

    // disable the button logic (is disabled when is freemium and is pre and post trial)
    if (isSystemAdmin && isCloud && !isCloudFreeTrial && !isPaidSubscription) {
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
