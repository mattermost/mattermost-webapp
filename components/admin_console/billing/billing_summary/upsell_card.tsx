// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useIntl} from 'react-intl';

import WomanUpArrowsAndCloudsSvg from 'components/common/svg_images_components/woman_up_arrows_and_clouds_svg';
import {Message, t} from 'utils/i18n';

import './upsell_card.scss';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';

const enterpriseAdvantages = [
    {
        id: t('upsell_advantages.onelogin_saml'),
        defaultMessage: 'OneLogin/ADFS SAML 2.0',
    },
    {
        id: t('upsell_advantages.openid'),
        defaultMessage: 'OpenID Connect',
    },
    {
        id: t('upsell_advantages.office365'),
        defaultMessage: 'Office365 suite integration',
    },
];

interface Props {
    advantages: Message[];
    title: Message;
    andMore: boolean;
    cta: Message;
}

const andMore = {
    id: t('upsell_advantages.more'),
    defaultMessage: 'And more...',
};

export default function UpsellCard(props: Props) {
    const intl = useIntl();
    return (
        <div className='UpsellCard'>
            <div className='UpsellCard__illustration'>
                <WomanUpArrowsAndCloudsSvg
                    width={200}
                    height={200}
                />
            </div>
            <div className='UpsellCard__title'>
                {intl.formatMessage(props.title)}
            </div>
            <div className='UpsellCard__advantages'>
                {props.advantages.map((message: any) => {
                    return (
                        <div
                            className='advantage'
                            key={message.id}
                        >
                            <i className='fa fa-lock'/>{intl.formatMessage(message)}
                        </div>
                    );
                })}
                {props.andMore && <div className='advantage advantage--more'>
                    <i className='fa fa-lock'/>{intl.formatMessage(andMore)}
                </div>
                }
            </div>
            <div>
                <CloudStartTrialButton
                    message={
                        intl.formatMessage(
                            {
                                id: props.cta.message.id,
                                defaultMessage: props.cta.message.defaultMessage,
                            },
                            props.cta.message.values,
                        )
                    }
                    telemetryId={'start_cloud_trial_billing_subscription'}
                    extraClass='UpsellCard__cta'
                />
            </div>
        </div>
    );
}

export const tryEnterpriseCard = (
    <UpsellCard
        title={{
            id: t('admin.billing.subscriptions.billing_summary.try_enterprise'),
            defaultMessage: 'Try Enterprise features for free',
        }}
        cta={{
            id: t('admin.billing.subscriptions.billing_summary.try_enterprise.cta'),
            defaultMessage: 'Try free for {trialLength} days',
            values: {
                trialLength: 30,
            },
        }}
        andMore={true}
        advantages={enterpriseAdvantages}
    />
);
