// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

type Props = {
    additionalClassName: string | null;
}

export default class NextIcon extends React.PureComponent<Props> {
    public static defaultProps: Props = {
        additionalClassName: null,
    };

    public render() {
        const className = 'fa fa-1x fa-angle-right' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <FormattedMessage
                id='generic_icons.next'
                defaultMessage='Next Icon'
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
