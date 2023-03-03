// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {LicenseLinks} from './constants';

const baseZendeskFormURL = 'https://support.mattermost.com/hc/en-us/requests/new';

export enum ZendeskSupportForm {
    SELF_HOSTED_SUPPORT_FORM = '11184911962004',
    CLOUD_SUPPORT_FORM = '11184929555092',
    MOBILE_SUPPORT_FORM = '11184464799380',
    BILLING_LICENSING_SALES_SUPPORT_FORM = '360000852671',
}

export enum ZendeskFormFieldIDs {
    CLOUD_WORKSPACE_URL = '5245314479252',
    SELF_HOSTED_ENVIRONMENT = '360026980452',
    BILLING_SALES_CATEGORY = '360031056451',
    EMAIL = 'anonymous_requester_email',
    SUBJECT = 'subject',
}

export enum ZendeskFormFieldValues {
    SALES_GENERAL = 'sales_general',
    SALES_RENEWALS = 'sales-renewals',
    SALES_PRICING = 'sales_pricing',
}

export enum ZendeskFormPrefillSubjects {
    GENERAL_INQUIRY = 'General Inquiry',
    PASSWORD_RESET = 'Support for password reset process',
    LICENSE_PURCHASE = 'License purchase',
    LICENSE_RENEWAL = 'License renewal',
    LICENSE_EXPANSION = 'License expansion',
}

export type PrefillFieldFormFieldIDs = {
    id: ZendeskFormFieldIDs;
    val: string;
}

export const buildZendeskSupportForm = (form: ZendeskSupportForm, formFieldIDs: PrefillFieldFormFieldIDs[]): string => {
    let formUrl = `${baseZendeskFormURL}?ticket_form_id=${form}`;

    formFieldIDs.forEach((formPrefill) => {
        formUrl = formUrl.concat(`&tf_${formPrefill.id}=${formPrefill.val}`);
    });

    if (form === ZendeskSupportForm.SELF_HOSTED_SUPPORT_FORM) {
        formUrl = formUrl.concat(`&tf_${ZendeskFormFieldIDs.SELF_HOSTED_ENVIRONMENT}=production`);
    }

    return formUrl;
};

export const goToBillingGeneralSalesSupportForm = (email: string, subject: string) => {
    const form = ZendeskSupportForm.BILLING_LICENSING_SALES_SUPPORT_FORM;
    const url = buildZendeskSupportForm(form, [
        {id: ZendeskFormFieldIDs.EMAIL, val: email},
        {id: ZendeskFormFieldIDs.SUBJECT, val: subject},
        {id: ZendeskFormFieldIDs.BILLING_SALES_CATEGORY, val: ZendeskFormFieldValues.SALES_GENERAL},
    ]);
    window.open(url, '_blank');
};

export const goToSelfHostedSupportForm = (email: string, subject: string) => {
    const form = ZendeskSupportForm.SELF_HOSTED_SUPPORT_FORM;
    const url = buildZendeskSupportForm(form, [
        {id: ZendeskFormFieldIDs.EMAIL, val: email},
        {id: ZendeskFormFieldIDs.SUBJECT, val: subject},
    ]);
    window.open(url, '_blank');
};

export const goToCloudSupportForm = (email: string, subject: string, workspaceURL: string) => {
    const form = ZendeskSupportForm.SELF_HOSTED_SUPPORT_FORM;
    let url = buildZendeskSupportForm(form, [
        {id: ZendeskFormFieldIDs.EMAIL, val: email},
        {id: ZendeskFormFieldIDs.SUBJECT, val: subject},
    ]);
    url = url.concat(`&tf_${ZendeskFormFieldIDs.CLOUD_WORKSPACE_URL}=${workspaceURL}`);
    window.open(url, '_blank');
};

const encodeString = (s: string) => {
    return Buffer.from(s).toString('base64');
};

const buildMMURL = (baseURL: string, firstName: string, lastName: string, companyName: string, businessEmail: string) => {
    const mmURL = `${baseURL}?qk=${encodeString(firstName)}&qp=${encodeString(lastName)}&qw=${encodeString(companyName)}&qx=${encodeString(businessEmail)}`;
    return mmURL;
};

export const goToMattermostContactSalesForm = (firstName: string, lastName: string, companyName: string, businessEmail: string) => {
    const url = buildMMURL(LicenseLinks.CONTACT_SALES, firstName, lastName, companyName, businessEmail);
    window.open(url, '_blank');
};
