// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import BlockableLink from 'components/admin_console/blockable_link';

type Props = {

};

const PaymentInfo: React.FC<Props> = () => {
    return (
        <div className='wrapper--fixed PaymentInfo'>
            <FormattedAdminHeader
                id='admin.billing.payment_info.title'
                defaultMessage='Payment Information'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <div style={{border: '1px solid #000', width: '100%', height: '81px', marginBottom: '20px'}}>
                        {'Alert Banner (credit card expired/about to expire)'}
                    </div>
                    <div style={{border: '1px solid #000', width: '100%', height: '484px'}}>
                        {'Payment Details Card'}
                        <BlockableLink
                            to='/admin_console/billing/payment_info_edit'
                        >
                            <FormattedMessage
                                id='admin.billing.payment_info.add'
                                defaultMessage='Add Payment Information'
                            />
                        </BlockableLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfo;
