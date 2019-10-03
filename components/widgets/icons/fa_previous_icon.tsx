// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {injectIntl, IntlShape} from 'react-intl';

type Props = {
    intl: IntlShape;
} & Partial<DefaultProps>

type DefaultProps = {
    additionalClassName: string | null;
}

class PreviousIcon extends React.PureComponent<Props> {
    public static defaultProps: DefaultProps = {
        additionalClassName: null,
    };

    public render(): JSX.Element {
        const {formatMessage} = this.context.intl;
        const className = 'fa fa-1x fa-angle-left' + (this.props.additionalClassName ? ' ' + this.props.additionalClassName : '');
        return (
            <i
                className={className}
                title={formatMessage({id: 'generic_icons.previous', defaultMessage: 'Previous Icon'})}
            />
        );
    }
}

export default injectIntl(PreviousIcon);
