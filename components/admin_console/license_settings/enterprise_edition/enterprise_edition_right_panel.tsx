// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';
import {FormattedMessage} from 'react-intl';

import {ClientLicense} from 'mattermost-redux/types/config';
import {LicenseSkus} from 'mattermost-redux/types/general';

import WomanUpArrowsAndCloudsSvg from 'components/common/svg_images_components/woman_up_arrows_and_clouds_svg';
import ContactUsButton from 'components/announcement_bar/contact_sales/contact_us';
import WomanWithCardSvg from 'components/common/svg_images_components/woman_with_card_svg';
import TwoPeopleChattingSvg from 'components/common/svg_images_components/two_people_chatting_svg';

export interface EnterpriseEditionProps {
    isTrialLicense: boolean;
    license: ClientLicense;
}

const EnterpriseEditionRightPanel: React.FC<EnterpriseEditionProps> = ({
    isTrialLicense,
    license,

}: EnterpriseEditionProps) => {
    const upgradeAdvantages = [
        'AD/LDAP Group sync',
        'High Availability',
        'Advanced compliance',
        'Advanced roles and permissions',
    ];

    const skuShortName = license.SkuShortName;

    const contactSalesBtn = (
        <div className='purchase-card'>
            <ContactUsButton
                eventID='post_trial_contact_sales'
                customClass='light-blue-btn'
            />
        </div>
    );

    const title = () => {
        if (isTrialLicense) {
            return (
                <FormattedMessage
                    id='admin.license.purchaseEnterprisePlanTitle'
                    defaultMessage='Purchase the Enterprise Plan'
                />
            );
        }
        if (skuShortName === LicenseSkus.Enterprise) {
            return (
                <FormattedMessage
                    id='admin.license.enterprisePlanTitle'
                    defaultMessage='Need to increase your headcount?'
                />
            );
        }
        return (
            <FormattedMessage
                id='admin.license.upgradeToEnterprise'
                defaultMessage='Upgrade to the Enterprise plan'
            />
        );
    };

    const svgImage = () => {
        if (isTrialLicense) {
            return (
                <WomanWithCardSvg
                    width={100}
                    height={100}
                />
            );
        }
        if (skuShortName === LicenseSkus.Enterprise) {
            return (
                <TwoPeopleChattingSvg
                    width={100}
                    height={100}
                />
            );
        }
        return (
            <WomanUpArrowsAndCloudsSvg
                width={100}
                height={100}
            />
        );
    };

    const subtitle = () => {
        if (isTrialLicense) {
            return (
                <FormattedMessage
                    id='admin.license.purchaseEnterprisePlanSubtitle'
                    defaultMessage='Continue your access to Enterprise features by purchasing a license today.'
                />
            );
        }
        if (skuShortName === LicenseSkus.Enterprise) {
            return (
                <FormattedMessage
                    id='admin.license.enterprisePlanSubtitle'
                    defaultMessage='We’re here to work with you and your needs. Contact us today to get more seats on your plan.'
                />
            );
        }
        return (
            <div className='advantages-list'>
                {upgradeAdvantages.map((item: string, i: number) => {
                    return (
                        <div
                            className='item'
                            key={i.toString()}
                        >
                            <i className='fa fa-lock'/>{item}
                        </div>
                    );
                })}
                <FormattedMessage
                    id='admin.license.andMore'
                    defaultMessage='And more...'
                />
            </div>
        );
    };

    return (
        <div className='EnterpriseEditionRightPannel'>
            <div className='svg-image'>
                {svgImage()}
            </div>
            <div className='upgrade-title'>
                {title()}
            </div>
            <div className='upgrade-subtitle'>
                {subtitle()}
            </div>
            <div className='purchase_buttons'>
                {contactSalesBtn}
            </div>
        </div>
    );
};

export default React.memo(EnterpriseEditionRightPanel);
