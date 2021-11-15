// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';
import {FormattedMessage} from 'react-intl';

import WomanUpArrowsAndCloudsSvg from 'components/common/svg_images_components/woman_up_arrows_and_clouds_svg';
import PurchaseLink from 'components/announcement_bar/purchase_link/purchase_link';
import ContactUsButton from 'components/announcement_bar/contact_sales/contact_us';

const StarterRightPanel: React.FC = () => {
    const upgradeAdvantages = [
        'OneLogin/ADFS SAML 2.0',
        'OpenID Connect',
        'Office365 suite integration',
        'Read-only announcement channels',
    ];

    const purchaseLicenseBtns = (
        <div className='purchase-card'>
            <PurchaseLink
                eventID='post_trial_purchase_license'
                buttonTextElement={
                    <FormattedMessage
                        id='admin.license.trialCard.purchase'
                        defaultMessage='Purchase'
                    />
                }
            />
            <ContactUsButton
                eventID='post_trial_contact_sales'
                customClass='light-blue-btn'
            />
        </div>
    );

    return (
        <div className='StarterEditionRightPannel'>
            <div className='svg-image'>
                <WomanUpArrowsAndCloudsSvg
                    width={100}
                    height={100}
                />
            </div>
            <div className='upgrade-title'>
                <FormattedMessage
                    id='admin.license.upgradeTitle'
                    defaultMessage='Upgrade to the Professional Plan'
                />
            </div>
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
            <div className='purchase_buttons'>
                {purchaseLicenseBtns}
            </div>
        </div>
    );
};

export default React.memo(StarterRightPanel);
