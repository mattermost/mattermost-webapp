// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
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

export default class BackButton extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        url: '/',
    }

    public render(): JSX.Element {
        return (
            <div
                id='back_button'
                className='signup-header'
            >
                <Link
                    onClick={this.props.onClick}
                    to={this.props.url}
                >
                    <FormattedMessage
                        id='generic_icons.back'
                        defaultMessage='Back Icon'
                    >
                        {(title: string | JSX.Element) => (
                            <span
                                id='back_button_icon'
                                className='fa fa-1x fa-angle-left'
                                title={title.toString()}
                            />
                        )}
                    </FormattedMessage>
                    <FormattedMessage
                        id='web.header.back'
                        defaultMessage='Back'
                    />
                </Link>
            </div>
        );
    }
}
