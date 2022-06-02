// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

export enum InquiryType {
    Technical = 'technical',
    Sales = 'sales',
    Billing = 'billing',
}

export enum TechnicalInquiryIssue {
    AdminConsole = 'admin_console',
    MattermostMessaging = 'mm_messaging',
    DataExport = 'data_export',
    Other = 'other',
}

export enum SalesInquiryIssue {
    AboutPurchasing = 'about_purchasing',
    CancelAccount = 'cancel_account',
    PurchaseNonprofit = 'purchase_nonprofit',
    TrialQuestions = 'trial_questions',
    UpgradeEnterprise = 'upgrade_enterprise',
    SomethingElse = 'something_else',
}

type Issue = SalesInquiryIssue | TechnicalInquiryIssue

export function getCloudContactUsLink(state: GlobalState): (inquiry: InquiryType, inquiryIssue?: Issue) => string {
    // cloud/contact-us with query params for name, email and inquiry
    const cwsUrl = getConfig(state).CWSURL;
    const user = getCurrentUser(state);
    const fullName = `${user.first_name} ${user.last_name}`;
    return (inquiry: InquiryType, inquiryIssue?: Issue) => {
        const inquiryIssueQuery = inquiryIssue ? `&inquiry-issue=${inquiryIssue}` : '';

        return `${cwsUrl}/cloud/contact-us?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(fullName)}&inquiry=${inquiry}${inquiryIssueQuery}`;
    }
}
