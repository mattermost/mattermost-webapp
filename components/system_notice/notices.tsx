// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import * as ServerVersion from 'utils/server_version';
import * as UserAgent from 'utils/user_agent';

import mattermostIcon from 'images/icon50x50.png';
import {Notice} from 'components/system_notice/types';

// Notices are objects with the following fields:
//  - name - string identifier
//  - adminOnly - set to true if only system admins should see this message
//  - icon - the image to display for the notice icon
//  - title - JSX node to display for the notice title
//  - body - JSX node to display for the notice body
//  - allowForget - boolean to allow forget the notice
//  - show - function that check if we need to show the notice
//
// Order is important! The notices at the top are shown first.

const notices: Notice[] = [
    {
        name: 'apiv3_deprecation',
        adminOnly: true,
        title: (
            <FormattedMarkdownMessage
                id='system_notice.title'
                defaultMessage='**Notice**\nfrom Mattermost'
            />
        ),
        icon: mattermostIcon,
        body: (
            <FormattedMessage
                id='system_notice.body.api3'
                defaultMessage='If you’ve created or installed integrations in the last two years, find out how <link>recent changes</link> may have affected them.'
                values={{
                    link: (msg: React.ReactNode) => (
                        <a
                            href='https://api.mattermost.com/#tag/APIv3-Deprecation'
                            target='_blank'
                            rel='noreferrer'
                        >
                            {msg}
                        </a>
                    ),
                }}
            />
        ),
        allowForget: true,
        show: (serverVersion, config) => {
            if (config.InstallationDate >= new Date(2018, 5, 16, 0, 0, 0, 0).getTime()) {
                return false;
            }
            return true;
        },
    },
    {
        name: 'advanced_permissions',
        adminOnly: true,
        title: (
            <FormattedMarkdownMessage
                id='system_notice.title'
                defaultMessage='**Notice**\nfrom Mattermost'
            />
        ),
        icon: mattermostIcon,
        body: (
            <FormattedMessage
                id='system_notice.body.permissions'
                defaultMessage='Some policy and permission System Console settings have moved with the release of <link>advanced permissions</link> into Mattermost Starter and Professional.'
                values={{
                    link: (msg: React.ReactNode) => (
                        <a
                            href='https://docs.mattermost.com/deployment/advanced-permissions.html'
                            target='_blank'
                            rel='noreferrer'
                        >
                            {msg}
                        </a>
                    ),
                }}
            />
        ),
        allowForget: true,
        show: (serverVersion, config, license) => {
            if (license.IsLicensed === 'false') {
                return false;
            }
            if (config.InstallationDate > new Date(2018, 5, 16, 0, 0, 0, 0).getTime()) {
                return false;
            }
            if (license.IsLicensed === 'true' && license.IssuedAt > new Date(2018, 5, 16, 0, 0, 0, 0).getTime()) {
                return false;
            }
            return true;
        },
    },
    {
        name: 'ee_upgrade_advice',
        adminOnly: true,
        title: (
            <FormattedMarkdownMessage
                id='system_notice.title'
                defaultMessage='**Notice**\nfrom Mattermost'
            />
        ),
        icon: mattermostIcon,
        body: (
            <FormattedMessage
                id='system_notice.body.ee_upgrade_advice'
                defaultMessage='Enterprise Edition is recommended to ensure optimal operation and reliability. <link>Learn more</link>.'
                values={{
                    link: (msg: React.ReactNode) => (
                        <a
                            href='https://mattermost.com/performance'
                            target='_blank'
                            rel='noreferrer'
                        >
                            {msg}
                        </a>
                    ),
                }}
            />
        ),
        allowForget: false,
        show: (serverVersion, config, license, analytics) => {
            const USERS_THRESHOLD = 10000;

            // If we don't have the analytics yet, don't show
            if (!analytics?.hasOwnProperty('TOTAL_USERS')) {
                return false;
            }

            if (analytics.TOTAL_USERS < USERS_THRESHOLD) {
                return false;
            }

            if (license.IsLicensed === 'true' && license.Cluster === 'true') {
                return false;
            }

            return true;
        },
    },
    {
        name: 'ie11_deprecation',
        title: (
            <FormattedMarkdownMessage
                id='system_notice.title'
                defaultMessage='**Notice**\nfrom Mattermost'
            />
        ),
        icon: mattermostIcon,
        allowForget: false,
        body: (
            <FormattedMessage
                id='system_notice.body.ie11_deprecation'
                defaultMessage='Your browser, IE11, will no longer be supported in an upcoming release. <link>Find out how to move to another browser in one simple step</link>.'
                values={{
                    link: (msg: React.ReactNode) => (
                        <a
                            href='https://forum.mattermost.com/t/mattermost-is-dropping-support-for-internet-explorer-ie11-in-v5-16/7575'
                            target='_blank'
                            rel='noreferrer'
                        >
                            {msg}
                        </a>
                    ),
                }}
            />
        ),
        show: (serverVersion) => {
            // Don't show the notice after v5.16, show a different notice
            if (ServerVersion.isServerVersionGreaterThanOrEqualTo(serverVersion, '5.16.0')) {
                return false;
            }

            // Only show if they're using IE
            if (!UserAgent.isInternetExplorer()) {
                return false;
            }

            return true;
        },
    },
];

export default notices;
