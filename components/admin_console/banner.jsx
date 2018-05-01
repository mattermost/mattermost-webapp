// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default function Banner(props) {
    let title = (
        <FormattedMessage
            id='admin.banner.heading'
            defaultMessage='Note:'
        />
    );

    if (props.title) {
        title = props.title;
    }

    return (
        <div className='banner'>
            <div className='banner__content'>
                <h4 className='banner__heading'>
                    {title}
                </h4>
                <p>
                    {props.description}
                </p>
            </div>
        </div>
    );
}

Banner.defaultProps = {
};
Banner.propTypes = {
    title: PropTypes.node,
    description: PropTypes.node.isRequired,
};
