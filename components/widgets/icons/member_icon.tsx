// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function MemberIcon(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='16px'
                height='16px'
                viewBox='0 0 18 18'
                role='img'
                aria-label={formatMessage({id: 'generic_icons.member', defaultMessage: 'Member Icon'})}
            >
                <path d='M15.48 12.51L12.6 10.8C12.648 10.74 12.72 10.644 12.816 10.512C13.02 10.26 13.158 10.056 13.23 9.89999C13.602 9.26399 13.89 8.55599 14.094 7.77599C14.298 6.98399 14.4 6.19199 14.4 5.39999C14.4 4.33199 14.172 3.38999 13.716 2.57399C13.272 1.75799 12.642 1.12799 11.826 0.683987C11.01 0.227987 10.068 -1.26362e-05 9 -1.26362e-05C7.932 -1.26362e-05 6.99 0.227987 6.174 0.683987C5.358 1.12799 4.722 1.75799 4.266 2.57399C3.822 3.38999 3.6 4.33199 3.6 5.39999C3.6 6.19199 3.708 6.98999 3.924 7.79399C4.116 8.56199 4.398 9.29399 4.77 9.98999C4.95 10.35 5.16 10.65 5.4 10.89L2.52 12.6C2.04 12.78 1.65 13.11 1.35 13.59C1.05 14.058 0.9 14.562 0.9 15.102C0.9 15.642 1.026 16.134 1.278 16.578C1.53 17.022 1.878 17.37 2.322 17.622C2.766 17.874 3.252 18 3.78 18H14.22C14.748 18 15.234 17.874 15.678 17.622C16.122 17.37 16.47 17.022 16.722 16.578C16.974 16.134 17.1 15.642 17.1 15.102C17.1 14.562 16.95 14.052 16.65 13.572C16.362 13.092 15.972 12.738 15.48 12.51ZM5.4 5.39999C5.4 4.19999 5.754 3.28199 6.462 2.64599C7.098 2.08199 7.944 1.79999 9 1.79999C10.056 1.79999 10.902 2.08199 11.538 2.64599C12.246 3.28199 12.6 4.19999 12.6 5.39999C12.6 6.25199 12.468 7.06799 12.204 7.84799C11.904 8.69999 11.496 9.38399 10.98 9.89999C10.38 10.5 9.72 10.8 9 10.8C8.28 10.8 7.62 10.5 7.02 9.89999C6.504 9.38399 6.102 8.69999 5.814 7.84799C5.538 7.06799 5.4 6.25199 5.4 5.39999ZM14.22 16.2H3.78C3.468 16.2 3.21 16.098 3.006 15.894C2.802 15.69 2.7 15.432 2.7 15.12C2.7 14.904 2.754 14.712 2.862 14.544C2.982 14.364 3.138 14.226 3.33 14.13L6.84 12.06C7.56 12.42 8.28 12.6 9 12.6C9.756 12.6 10.446 12.42 11.07 12.06L14.58 14.13C14.772 14.226 14.922 14.364 15.03 14.544C15.15 14.712 15.21 14.904 15.21 15.12C15.258 15.432 15.186 15.69 14.994 15.894C14.802 16.098 14.544 16.2 14.22 16.2Z'/>
            </svg>
        </span>
    );
}
