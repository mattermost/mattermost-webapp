// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import BlockableLink from 'components/admin_console/blockable_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import noCompanyInfoGraphic from 'images/no_company_info_graphic.svg';

import './company_info_display.scss';

const addInfoButton = (
    <div className='CompanyInfoDisplay__addInfo'>
        <BlockableLink
            to='/admin_console/billing/company_info_edit'
            className='CompanyInfoDisplay__addInfoButton'
        >
            <i className='icon icon-plus'/>
            <FormattedMessage
                id='admin.billing.company_info.add'
                defaultMessage='Add Company Information'
            />
        </BlockableLink>
    </div>
);

const noCompanyInfoSection = (
    <div className='CompanyInfoDisplay__noCompanyInfo'>
        <img
            className='ComapnyInfoDisplay__noCompanyInfo-graphic'
            src={noCompanyInfoGraphic}
        />
        <div className='CompanyInfoDisplay__noCompanyInfo-message'>
            <FormattedMessage
                id='admin.billing.company_info_display.noCompanyInfo'
                defaultMessage='There is currently no company information on file.'
            />
        </div>
        <BlockableLink
            to='/admin_console/billing/company_info_edit'
            className='CompanyInfoDisplay__noCompanyInfo-link'
        >
            <FormattedMessage
                id='admin.billing.company_info.add'
                defaultMessage='Add Company Information'
            />
        </BlockableLink>
    </div>
);

const CompanyInfoDisplay: React.FC = () => {
    const companyInfo = {
        company_name: 'Dunder Mifflin',
        num_employees: 200,
        address_1: 'Unit 5, 135 Sixth Ave',
        address_2: '',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        postal_code: '90210',
    };
    //const companyInfo = undefined;

    let body = noCompanyInfoSection;

    if (companyInfo) {
        body = (
            <div className='CompanyInfoDisplay__companyInfo'>
                <div className='CompanyInfoDisplay__companyInfo-text'>
                    <div className='CompanyInfoDisplay__companyInfo-name'>
                        {companyInfo.company_name}
                    </div>
                    <div className='CompanyInfoDisplay__companyInfo-numEmployees'>
                        <FormattedMarkdownMessage
                            id='admin.billing.company_info.employees'
                            defaultMessage='{employees} employees'
                            values={{employees: companyInfo.num_employees}}
                        />
                    </div>
                    <div className='CompanyInfoDisplay__companyInfo-addressTitle'>
                        <FormattedMessage
                            id='admin.billing.company_info.companyAddress'
                            defaultMessage='Company Address'
                        />
                    </div>
                    <div className='CompanyInfoDisplay__companyInfo-address'>
                        <div>{companyInfo.address_1}</div>
                        {companyInfo.address_2 && <div>{companyInfo.address_2}</div>}
                        <div>{`${companyInfo.city}, ${companyInfo.state}, ${companyInfo.postal_code}`}</div>
                        <div>{companyInfo.country}</div>
                    </div>
                </div>
                <div className='CompanyInfoDisplay__companyInfo-edit'>
                    <BlockableLink
                        to='/admin_console/billing/company_info_edit'
                        className='CompanyInfoDisplay__companyInfo-editButton'
                    >
                        <i className='icon icon-pencil-outline'/>
                    </BlockableLink>
                </div>
            </div>
        );
    }

    return (
        <div className='CompanyInfoDisplay'>
            <div className='CompanyInfoDisplay__header'>
                <div className='CompanyInfoDisplay__headerText'>
                    <div className='CompanyInfoDisplay__headerText-top'>
                        <FormattedMessage
                            id='admin.billing.company_info_display.companyDetails'
                            defaultMessage='Company Details'
                        />
                    </div>
                    <div className='CompanyInfoDisplay__headerText-bottom'>
                        <FormattedMessage
                            id='admin.billing.company_info_display.provideDetails'
                            defaultMessage='Provide your company name and address'
                        />
                    </div>
                </div>
                {!companyInfo && addInfoButton}
            </div>
            <div className='CompanyInfoDisplay__body'>
                {body}
            </div>
        </div>
    );
};

export default CompanyInfoDisplay;
