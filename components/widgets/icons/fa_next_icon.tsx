// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {intlShape} from 'utils/react_intl';

type Props = {
    additionalClassName: string | null;
}

export default class NextIcon extends React.PureComponent<Props> {
    public static contextTypes = {
        intl: intlShape.isRequired,
    };

    public static defaultProps: Props = {
        additionalClassName: null,
    };

    public render(): JSX.Element {
        const {formatMessage} = this.context.intl;
        const className = 'fa fa-1x fa-angle-right' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <i
                className={className}
                title={formatMessage({id: 'generic_icons.next', defaultMessage: 'Next Icon'})}
            />
        );
    }
}
