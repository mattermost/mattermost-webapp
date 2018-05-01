// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class SiteNameAndDescription extends React.PureComponent {
    static propTypes = {
        customDescriptionText: PropTypes.string,
        isLicensed: PropTypes.bool,
        siteName: PropTypes.string,
    };

    static defaultProps = {
        isLicensed: false,
        siteName: 'Mattermost',
    };

    render() {
        const {
            customDescriptionText,
            isLicensed,
            siteName,
        } = this.props;
        let description = null;
        if (isLicensed && customDescriptionText) {
            description = customDescriptionText;
        } else {
            description = (
                <FormattedMessage
                    id='web.root.signup_info'
                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                />
            );
        }

        return (
            <React.Fragment>
                <h1>{siteName}</h1>
                <h4 className='color--light'>
                    {description}
                </h4>
            </React.Fragment>
        );
    }
}
