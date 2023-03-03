// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable mattermost/use-external-link */

import React from 'react';
import {useSelector} from 'react-redux';

import {isTelemetryEnabled} from 'actions/telemetry_actions';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

type ExternalLinkQueryParams = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    userId?: string;
}

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    queryParams?: ExternalLinkQueryParams;
    location?: string;
    children: React.ReactNode;
};

export default function ExternalLink(props: Props) {
    const userId = useSelector(getCurrentUserId);
    const telemetryEnabled = useSelector(isTelemetryEnabled);
    const config = useSelector(getConfig);
    const license = useSelector(getLicense);
    let href = props.href;
    if (telemetryEnabled && href?.includes('mattermost.com')) {
        // encode this stuff so it's not so transparent to the user?
        const existingURLSearchParams = new URL(href).searchParams;
        const existingQueryParamsObj = Object.fromEntries(existingURLSearchParams.entries());
        const queryParams = {
            utm_source: 'mattermost',
            utm_medium: license.Cloud === 'true' ? 'in-product-cloud' : 'in-product',
            utm_content: props.location || '',
            userId,
            serverId: config.TelemetryId || '',
            ...props.queryParams,
            ...existingQueryParamsObj,
        };
        const queryString = new URLSearchParams(queryParams).toString();

        if (Object.keys(existingQueryParamsObj).length) {
            // If the href already has query params, remove them before adding them back with the addition of the new ones
            href = href?.split('?')[0];
        }
        href = `${href}?${queryString}`;
    }

    return (
        <a
            {...props}
            target={props.target || '_blank'}
            rel={props.rel || 'noopener noreferrer'}
            onClick={props.onClick}
            href={href}
        >
            {props.children}
        </a>
    );
}
