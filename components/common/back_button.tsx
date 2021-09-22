// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Link} from 'react-router-dom';

type Props = {

    /**
     * URL to return to
     */
    url: string;

    /**
     * onClick handler when user clicks back button
     */
    onClick?: React.EventHandler<React.MouseEvent>;
}

const BackButton = (props: Props): JSX.Element => {
    const {formatMessage} = useIntl();

    return (
        <div
            id='back_button'
            className='signup-header'
        >
            <Link
                onClick={props.onClick}
                to={props.url}
            >
                <span
                    id='back_button_icon'
                    className='fa fa-1x fa-angle-left'
                    title={formatMessage({id: 'generic_icons.back', defaultMessage: 'Back Icon'})}
                />
                <FormattedMessage
                    id='web.header.back'
                    defaultMessage='Back'
                />
            </Link>
        </div>
    );
};
BackButton.defaultProps = {
    url: '/',
};

export default BackButton;
