// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import {useIntl} from 'react-intl';

export default function MattermostLogo(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width="500px"
                height="500px"
                viewBox="0 0 500 500"
                aria-label={formatMessage({id: 'generic_icons.mattermost', defaultMessage: 'Mattermost Logo'})}
            >
                <rect x="0.200012" width="500" height="500" rx="121.424" fill="#F22F63"/>
                <rect x="106" y="260" width="144" height="100" rx="12.2" fill="white" fill-opacity="0.4"/>
                <rect x="178" y="200" width="144" height="100" rx="12.2" fill="white" fill-opacity="0.6"/>
                <rect x="250" y="140" width="144" height="100" rx="12.2" fill="white"/>
            </svg>
        </span>
    );
}

const style: CSSProperties = {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
};
