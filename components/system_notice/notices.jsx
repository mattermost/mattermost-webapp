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
                defaultMessage='If you’ve created or installed integrations in the last two years, find out how <a href="https://about.mattermost.com/default-apiv3-deprecation-guide" target="_blank">upcoming changes</a> may affect them.'
            />
        ),
    },
];
