// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class AdminEyeIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.adminOnlyIcon'
                    defaultMessage='Admin View Only Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='14'
                            height='10'
                            viewBox='0 0 14 10'
                            fill='none'
                            role='img'
                            aria-label={ariaLabel}
                        >
                            <path
                                d='M7 3.21005C7.3264 3.21005 7.624 3.29165 7.8928 3.45485C8.1712 3.61805 8.392 3.83885 8.5552 4.11725C8.7184 4.38605 8.8 4.68365 8.8 5.01005C8.8 5.33645 8.7184 5.63885 8.5552 5.91725C8.392 6.18605 8.1712 6.40205 7.8928 6.56525C7.624 6.72845 7.3264 6.81005 7 6.81005C6.6736 6.81005 6.3712 6.72845 6.0928 6.56525C5.824 6.40205 5.608 6.18605 5.4448 5.91725C5.2816 5.63885 5.2 5.33645 5.2 5.01005C5.2 4.68365 5.2816 4.38605 5.4448 4.11725C5.608 3.83885 5.824 3.61805 6.0928 3.45485C6.3712 3.29165 6.6736 3.21005 7 3.21005ZM7 0.502848C7.9792 0.502848 8.9152 0.694848 9.808 1.07885C10.672 1.46285 11.4304 1.99565 12.0832 2.67725C12.7456 3.35885 13.2496 4.13645 13.5952 5.01005C13.2496 5.88365 12.7456 6.66125 12.0832 7.34285C11.4304 8.02445 10.672 8.55245 9.808 8.92685C8.9152 9.31085 7.9792 9.50285 7 9.50285C6.0208 9.50285 5.0848 9.31085 4.192 8.92685C3.328 8.55245 2.5648 8.02445 1.9024 7.34285C1.2496 6.66125 0.7504 5.88365 0.4048 5.01005C0.7504 4.13645 1.2496 3.35885 1.9024 2.67725C2.5648 1.99565 3.328 1.46285 4.192 1.07885C5.0848 0.694848 6.0208 0.502848 7 0.502848ZM1.7152 5.01005C2.0416 5.67245 2.4736 6.25325 3.0112 6.75245C3.5488 7.25165 4.1584 7.63565 4.84 7.90445C5.5312 8.17325 6.2512 8.30765 7 8.30765C8.1328 8.30765 9.1744 8.01005 10.1248 7.41485C11.0752 6.81965 11.8 6.01805 12.2992 5.01005C11.8 4.00205 11.0752 3.20045 10.1248 2.60525C9.1744 2.01005 8.1328 1.71245 7 1.71245C6.2512 1.71245 5.5312 1.84685 4.84 2.11565C4.1584 2.38445 3.5488 2.76845 3.0112 3.26765C2.4736 3.76685 2.0416 4.34765 1.7152 5.01005Z'
                                fill='rgba(var(--center-channel-color-rgb), 0.72)'
                                fillOpacity='0.48'
                            />
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
