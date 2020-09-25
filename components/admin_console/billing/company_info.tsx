// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import CompanyInfoDisplay from './company_info_display';

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
                    <CompanyInfoDisplay/>
                    <div style={{border: '1px solid #000', width: '100%', height: '194px', marginTop: '20px'}}>
                        {'Billing Admins Card'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfo;
