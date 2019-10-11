// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

type Props = {
    additionalClassName: string;
}

export default class PreviousIcon extends React.PureComponent<Props> {
    public static defaultProps: Props = {
        additionalClassName: '',
    };

    public render() {
        const className = 'fa fa-1x fa-angle-left' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <FormattedMessage
                id='generic_icons.previous'
                defaultMessage='Previous Icon'
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
