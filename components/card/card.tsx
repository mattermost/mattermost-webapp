// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Children, isValidElement, cloneElement} from 'react';
import classNames from 'classnames';

import CardHeader from './card_header';
import CardBody from './card_body';

import './card.scss';

type Props = {
    expanded?: boolean;
    className?: string;
}

export default class Card extends React.PureComponent<Props> {
    public static Header = CardHeader;
    public static Body = CardBody;

    render() {
        const {expanded, children} = this.props;

        const childrenWithProps = Children.map(children, (child) => {
            // Checking isValidElement is the safe way and avoids a TS error too.
            if (isValidElement(child)) {
                return cloneElement(child, {expanded});
            }
            return child;
        });

        return (
            <div
                className={classNames('Card', this.props.className, {
                    expanded,
                })}
            >
                {childrenWithProps}
            </div>
        );
    }
}
