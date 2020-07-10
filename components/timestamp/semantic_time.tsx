// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

type Props = {
    value: Date;
    className?: string;
    label?: string;
};

export default class SemanticTime extends PureComponent<Props> {
    render() {
        const {
            value,
            className,
            label = value.toString(),
            children,
        } = this.props;

        return (
            <time
                aria-label={label}
                dateTime={value.toISOString()}
                className={className}
            >
                {children}
            </time>
        );
    }
}
