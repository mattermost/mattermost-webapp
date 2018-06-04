// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedHTMLMessage} from 'react-intl';

import mattermostIcon from 'images/icon50x50.png';

// Notices are objects with the following fields:
//  - name - string identifier
//  - adminOnly - set to true if only system admins should see this message
//  - icon - the image to display for the notice icon
//  - title - JSX node to display for the notice title
//  - body - JSX node to display for the notice body
//
// Order is important! The notices at the top are shown first.
export default [
    {
        name: 'apiv3_deprecation',
        adminOnly: true,
        title: (
            <FormattedHTMLMessage
                id='system_notice.title'
                defaultMessage='<strong>Notice</strong> from Mattermost'
            />
        ),
        icon: mattermostIcon,
        body: (
            <FormattedHTMLMessage
                id='system_notice.body.api3'
                defaultMessage='If you’ve created or installed integrations in the last two years, find out how <a href="https://about.mattermost.com/default-apiv3-deprecation-guide" target="_blank">recent changes</a> may have affected them.'
            />
        ),
    },
    {
        name: 'advanced_permissions',
        adminOnly: true,
        title: (
            <FormattedHTMLMessage
                id='system_notice.title'
                defaultMessage='<strong>Notice</strong> from Mattermost'
            />
        ),
        icon: mattermostIcon,
        body: (
            <FormattedHTMLMessage
                id='system_notice.body.permissions'
                defaultMessage='Some policy and permission System Console settings have moved with the release of <a href="https://about.mattermost.com/default-advanced-permissions" target="_blank">advanced permissions</a> in Enterprise E10 and E20.'
            />
        ),
    },
];
