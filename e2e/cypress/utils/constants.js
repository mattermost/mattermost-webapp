// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const FEEDBACK_EMAIL = 'test@example.com';
export const ABOUT_LINK = 'https://about.mattermost.com/default-about/';
export const HELP_LINK = 'https://about.mattermost.com/default-help/';
export const PRIVACY_POLICY_LINK = 'https://about.mattermost.com/default-privacy-policy/';
export const REPORT_A_PROBLEM_LINK = 'https://about.mattermost.com/default-report-a-problem/';
export const TERMS_OF_SERVICE_LINK = 'https://about.mattermost.com/default-terms/';

export const CLOUD = 'Cloud';
export const E20 = 'E20';
export const TEAM = 'Team';

export const FixedCloudConfig = {
    EmailSettings: {
        FEEDBACK_EMAIL,
    },
    SupportSettings: {
        ABOUT_LINK,
        HELP_LINK,
        PRIVACY_POLICY_LINK,
        REPORT_A_PROBLEM_LINK,
        TERMS_OF_SERVICE_LINK,
    },
};

export const ServerEdition = {
    CLOUD,
    E20,
    TEAM,
};

export const Constants = {
    FixedCloudConfig,
    ServerEdition,
};

export default Constants;
