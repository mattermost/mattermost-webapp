// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

export default function PluginChannelHeaderIcon(props) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='16px'
                height='16px'
                viewBox='0 0 18 18'
                version='1.1'
                role='img'
                aria-label={formatMessage({id: t('generic_icons.plugins'), defaultMessage: 'Plugins'})}
            >
                <path d='M14.58 9.14399L17.136 6.60599C17.304 6.42599 17.388 6.20999 17.388 5.95799C17.388 5.70599 17.298 5.49599 17.118 5.32799C16.95 5.14799 16.74 5.05799 16.488 5.05799C16.236 5.05799 16.026 5.14799 15.858 5.32799L13.302 7.86599L10.134 4.69799L12.672 2.14199C12.852 1.97399 12.942 1.76399 12.942 1.51199C12.942 1.25999 12.852 1.04999 12.672 0.881987C12.504 0.701987 12.294 0.611987 12.042 0.611987C11.79 0.611987 11.574 0.695987 11.394 0.863987L8.856 3.41999L6.318 0.863987C6.138 0.695987 5.922 0.611987 5.67 0.611987C5.418 0.611987 5.208 0.695987 5.04 0.863987V0.881987C4.86 1.04999 4.77 1.25999 4.77 1.51199C4.77 1.76399 4.86 1.97399 5.04 2.14199L5.67 2.78999L2.808 5.65199C2.016 6.44399 1.458 7.36799 1.134 8.42399C0.81 9.45599 0.744 10.512 0.936 11.592C1.128 12.66 1.56 13.632 2.232 14.508L0.27 16.47C0.09 16.638 0 16.848 0 17.1C0 17.352 0.09 17.562 0.27 17.73C0.45 17.898 0.66 17.982 0.9 17.982C1.152 17.994 1.362 17.91 1.53 17.73L3.492 15.768C4.368 16.44 5.34 16.872 6.408 17.064C7.488 17.256 8.544 17.19 9.576 16.866C10.632 16.542 11.556 15.984 12.348 15.192L15.21 12.33L15.858 12.96C16.026 13.14 16.236 13.23 16.488 13.23C16.74 13.23 16.95 13.14 17.118 12.96H17.136C17.304 12.792 17.388 12.582 17.388 12.33C17.388 12.078 17.304 11.862 17.136 11.682L14.58 9.14399ZM11.088 13.914C10.452 14.55 9.702 14.976 8.838 15.192C8.01 15.408 7.176 15.408 6.336 15.192C5.472 14.976 4.722 14.55 4.086 13.914C3.45 13.278 3.024 12.528 2.808 11.664C2.592 10.824 2.592 9.98999 2.808 9.16199C3.024 8.29799 3.45 7.54799 4.086 6.91199L6.948 4.04999L13.95 11.052L11.088 13.914Z'/>
            </svg>
        </span>
    );
}
