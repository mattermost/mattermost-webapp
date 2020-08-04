// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import './card.scss';

type Props = {
    expanded?: boolean;
}

export default class CardBody extends React.PureComponent<Props> {
    card: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.card = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('resize', this.setInitialHeight);

        this.setInitialHeight();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setInitialHeight);
    }

    setInitialHeight = () => {
        if (this.card.current && this.props.expanded) {
            this.card.current.style.height = `${this.card.current.scrollHeight}px`;
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.card.current) {
            return;
        }

        if (this.props.expanded !== prevProps.expanded && this.props.expanded) {
            this.card.current.style.height = `${this.card.current.scrollHeight}px`;
        } else if (!this.props.expanded) {
            this.card.current.style.height = '';
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
