// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

export enum InquiryType {
    Technical = 'technical',
    Sales = 'sales',
    Billing = 'billing'
}

export enum InquiryIssue{
    CancelAccount = 'cancel_account',
    TrialQuestions = 'trial_questions'
}

export function getCloudContactUsLink(state: GlobalState, inquiry: InquiryType, inquiryIssue?: InquiryIssue): string {
    // cloud/contact-us with query params for name, email and inquiry
    const cwsUrl = getConfig(state).CWSUrl;
    const user = getCurrentUser(state);
    const fullName = `${user.first_name} ${user.last_name}`;
    const inquiryIssueQuery = inquiryIssue ? `&inquiry-issue=${inquiryIssue}` : '';

    return `${cwsUrl}/cloud/contact-us?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(fullName)}&inquiry=${inquiry}${inquiryIssueQuery}`;
}
