// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, { Children, isValidElement, cloneElement } from 'react';
import classNames from 'classnames';

import './card.scss';

type Props = {
    expanded?: boolean;
}

const CardHeader: React.FC<{children: React.ReactNode, expanded?: boolean}> = ({children, expanded}) => {
    return (
        <div className={classNames('Card__header', {expanded})}>
            {children}
        </div>
    );
}

class CardBody extends React.PureComponent<{expanded?: boolean}> {
    card: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.card = React.createRef();
    }

    componentDidMount() {
        if (this.card.current && this.props.expanded) {
            this.card.current.style.height = `${this.card.current.scrollHeight}px`;
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.card.current) {
            if (this.props.expanded !== prevProps.expanded && this.props.expanded) {
                this.card.current.style.height = `${this.card.current.scrollHeight}px`;
            } else {
                this.card.current.style.height = '';
            }
        }
    }

    render() {
        return (
            <div 
                ref={this.card}
                className={classNames('Card__body', {expanded: this.props.expanded})}
            >
                {this.props.children}
            </div>
        ); 
    }
}

export default class Card extends React.PureComponent<Props> {
    public static Header = CardHeader;
    public static Body = CardBody;

    render() {
        const {expanded, children} = this.props;

        const childrenWithProps = Children.map(children, child => {
            // Checking isValidElement is the safe way and avoids a TS error too.
            if (isValidElement(child)) {
                return cloneElement(child, {expanded});
            }
        
            return child;
        });

        return (
            <div
                className={'Card'}
            >
                {childrenWithProps}
            </div>
        );
    }
}