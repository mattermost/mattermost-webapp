// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

type Props = {
    additionalClassName: string;
}

export default class WarningIcon extends React.PureComponent<Props> {
    public static defaultProps: Props = {
        additionalClassName: '',
    };

    public render() {
        const className = 'fa fa-warning' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <FormattedMessage
                id='generic_icons.warning'
                defaultMessage='Warning Icon'
            >
                {(title) => (
                    <i
                        className={className}
                        title={title as string}
                    />
                )}
            </FormattedMessage>
        );
    }
}
