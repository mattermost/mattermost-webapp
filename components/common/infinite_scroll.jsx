// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

const SCROLL_BUFFER = 10;

export default class InfiniteScroll extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,

        /**
         * Function that is called to load more items
         */
        callBack: PropTypes.func.isRequired,

        /**
         * Boolean to indicate that no more data will be loaded
         */
        endOfData: PropTypes.bool.isRequired,

        /**
         * Message to display when all the data has been scrolled through
         */
        endOfDataMessage: PropTypes.string,

        /**
         * A wrapper class to define styling of the infinite scroll
         */
        styleClass: PropTypes.string,

        /**
         * A number that determines how far the scroll is near the bottom before
         * loading more items
         */
        bufferValue: PropTypes.number,
    };

    static defaultProps = {
        bufferValue: SCROLL_BUFFER,
        endOfDataMessage: 'No more items to load',
        styleClass: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
        };
        this.node = React.createRef();
    }

    componentDidMount() {
        this.node.current.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.node.current.removeEventListener('scroll', this.handleScroll);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.children === nextProps.children) {
            return;
        }

        this.setState({
            isFetching: false,
        });
    }

    validateBuffer = (buffer) => {
        if (buffer < SCROLL_BUFFER) {
            return SCROLL_BUFFER;
        }
        return Math.abs(buffer);
    }

    handleScroll = () => {
        const {isFetching} = this.state;
        const {callBack, endOfData, bufferValue} = this.props;
        const node = this.node.current;
        const validBuffer = this.validateBuffer(bufferValue);
        const toScroll = node.scrollHeight - node.clientHeight - validBuffer;
        const nearBottom = node.scrollTop > toScroll;
        if (nearBottom && !endOfData && !isFetching) {
            this.setState({
                isFetching: true,
            });
            callBack();
        }
    }

    render() {
        const {children, endOfData, endOfDataMessage, styleClass} = this.props;
        const {isFetching} = this.state;
        return (
            <>
                <div
                    className={`infinite-scroll ${styleClass}`}
                    ref={this.node}
                >
                    {children}
                </div>
                {isFetching && 'Fetching more items...'}
                {endOfData && endOfDataMessage}
            </>
        );
    }
}
