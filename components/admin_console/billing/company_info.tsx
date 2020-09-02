// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import BlockableLink from 'components/admin_console/blockable_link';

type Props = {

};

const CompanyInfo: React.FC<Props> = () => {
    return (
        <div className='wrapper--fixed CompanyInfo'>
            <FormattedAdminHeader
                id='admin.billing.company_info.title'
                defaultMessage='Company Information'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <div style={{border: '1px solid #000', width: '100%', height: '432px'}}>
                        {'Company Details Card'}
                        <BlockableLink
                            to='/admin_console/billing/company_info_edit'
                        >
                            <FormattedMessage
                                id='admin.billing.company_info.add'
                                defaultMessage='Add Company Information'
                            />
                        </BlockableLink>
                    </div>
                    <div style={{border: '1px solid #000', width: '100%', height: '194px', marginTop: '20px'}}>
                        {'Billing Admins Card'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfo;
