// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class GlobeIcon extends React.PureComponent {
    render() {
        return (
            <span {...this.props}>
                <FormattedMessage
                    id='generic_icons.channel.public'
                    defaultMessage='Public Channel Icon'
                >
                    {(ariaLabel) => (
                        <svg
                            width='13px'
                            height='13px'
                            viewBox='0 0 16 16'
                            role='presentation'
                            aria-label={ariaLabel}
                        >
                            <path d='M8 -2.47955e-05C6.56 -2.47955e-05 5.216 0.367975 3.968 1.10398C2.76267 1.80798 1.808 2.76264 1.104 3.96797C0.368 5.21598 0 6.55998 0 7.99998C0 9.43998 0.368 10.784 1.104 12.032C1.808 13.2373 2.76267 14.192 3.968 14.896C5.216 15.632 6.56 16 8 16C9.44 16 10.784 15.632 12.032 14.896C13.2373 14.192 14.192 13.2373 14.896 12.032C15.632 10.784 16 9.43998 16 7.99998C16 6.55998 15.632 5.21598 14.896 3.96797C14.192 2.76264 13.2373 1.80798 12.032 1.10398C10.784 0.367975 9.44 -2.47955e-05 8 -2.47955e-05ZM14.4 8.39998C14.2507 8.59198 13.92 8.80531 13.408 9.03998C12.768 9.31731 12.032 9.53064 11.2 9.67998V6.95998C12.288 6.77864 13.168 6.53864 13.84 6.23998C13.872 6.20798 13.9253 6.18131 14 6.15998C14.0853 6.12798 14.1387 6.10131 14.16 6.07998C14.32 6.63464 14.4 7.27464 14.4 7.99998V8.39998ZM6.8 11.52C6.93867 11.52 7.14133 11.536 7.408 11.568C7.67467 11.5893 7.872 11.6 8 11.6C8.53333 11.6 8.93333 11.5733 9.2 11.52C9.008 12.2773 8.8 12.912 8.576 13.424C8.36267 13.8933 8.17067 14.192 8 14.32C7.808 14.1813 7.61067 13.8826 7.408 13.424C7.152 12.8906 6.94933 12.256 6.8 11.52ZM8 9.99998C7.63733 9.99998 7.376 9.99464 7.216 9.98398C6.93867 9.97331 6.69333 9.95198 6.48 9.91998C6.48 9.74931 6.46933 9.46664 6.448 9.07198C6.416 8.61331 6.4 8.25598 6.4 7.99998V7.11998C6.77333 7.17331 7.30667 7.19998 8 7.19998C8.69333 7.19998 9.22667 7.17331 9.6 7.11998V7.99998C9.6 8.25598 9.584 8.61331 9.552 9.07198C9.53067 9.46664 9.52 9.74931 9.52 9.91998C9.30667 9.95198 9.06133 9.97331 8.784 9.98398C8.624 9.99464 8.36267 9.99998 8 9.99998ZM9.44 5.51998C9.12 5.57331 8.64 5.59998 8 5.59998C7.36 5.59998 6.88 5.57331 6.56 5.51998C6.656 4.82664 6.8 4.18131 6.992 3.58397C7.14133 3.07198 7.31733 2.62931 7.52 2.25597C7.69067 1.93598 7.85067 1.71731 8 1.59997C8.14933 1.71731 8.30933 1.93598 8.48 2.25597C8.68267 2.62931 8.85867 3.07198 9.008 3.58397C9.2 4.18131 9.344 4.82664 9.44 5.51998ZM13.44 4.63998C12.5867 5.00264 11.7867 5.24264 11.04 5.35997C10.9653 4.71997 10.848 4.11198 10.688 3.53598C10.5387 2.95998 10.3627 2.44798 10.16 1.99998C11.5573 2.49064 12.6507 3.37064 13.44 4.63998ZM2.56 4.63998C2.976 4.02131 3.456 3.49331 4 3.05597C4.576 2.58664 5.216 2.23464 5.92 1.99998C5.52533 2.87464 5.20533 3.99464 4.96 5.35997C3.92533 5.11464 3.12533 4.87464 2.56 4.63998ZM1.92 6.07998C1.952 6.11198 2.00533 6.14398 2.08 6.17598L2.24 6.23998C2.96533 6.55998 3.84533 6.79998 4.88 6.95998C4.848 7.09864 4.82667 7.26398 4.816 7.45598C4.80533 7.56264 4.8 7.74398 4.8 7.99998C4.8 8.74664 4.82667 9.30664 4.88 9.67998C4.048 9.53064 3.31733 9.31731 2.688 9.03998C2.16533 8.80531 1.82933 8.59198 1.68 8.39998V7.99998C1.63733 7.67998 1.63733 7.34931 1.68 7.00798C1.72267 6.66664 1.80267 6.35731 1.92 6.07998ZM2.16 10.56C3.14133 10.9546 4.128 11.2213 5.12 11.36C5.248 12.2133 5.51467 13.0933 5.92 14C5.088 13.7226 4.34133 13.2853 3.68 12.688C3.02933 12.08 2.52267 11.3706 2.16 10.56ZM13.84 10.56C13.4773 11.3706 12.9653 12.08 12.304 12.688C11.6533 13.2853 10.912 13.7226 10.08 14C10.4853 13.0933 10.752 12.2133 10.88 11.36C12.1493 11.1786 13.136 10.912 13.84 10.56Z'/>
                        </svg>
                    )}
                </FormattedMessage>
            </span>
        );
    }
}
