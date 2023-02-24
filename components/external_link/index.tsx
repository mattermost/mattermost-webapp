// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable mattermost/use-external-link */

import React from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';

import {isTelemetryEnabled} from 'actions/telemetry_actions';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

type ExternalLinkQueryParams = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    userId?: string;
}

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    target?: string;
    rel?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    queryParams?: ExternalLinkQueryParams;
    location?: string;
    children?: React.ReactNode;
};

export default function ExternalLink(props: Props) {
    const userId = useSelector((state: GlobalState) => state.entities.users.currentUserId);
    const telemetryEnabled = useSelector((state: GlobalState) => isTelemetryEnabled(state));
    const config = useSelector(getConfig);
    const license = useSelector(getLicense);
    let href = props.href;
    if (telemetryEnabled && href.includes('mattermost.com')) {
        // encode this stuff so it's not so transparent to the user?
        const queryParams = {
            utm_source: 'mattermost',
            utm_medium: license.Cloud === 'true' ? 'in-product-cloud' : 'in-product',
            utm_content: props.location || '',
            userId,
            serverId: config.TelemetryId || '',
            ...props.queryParams,
        };
        const queryString = new URLSearchParams(queryParams).toString();
        href = `${href}?${queryString}`;
    }

    return (
        <a
            {...props}
            target={props.target || '_blank'}
            rel={props.rel || 'noopener noreferrer'}
            onClick={props.onClick || (() => { })}
            href={href}
        >
            {props.children}
        </a>
    );
}
