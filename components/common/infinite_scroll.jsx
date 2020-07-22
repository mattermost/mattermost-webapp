// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import LoadingScreen from 'components/loading_screen';

const SCROLL_BUFFER = 100;
const DEBOUNCE_WAIT_TIME = 200;

export default class InfiniteScroll extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,

        /**
         * Function that is called to load more items
         */
        callBack: PropTypes.func.isRequired,

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
         * loading more items. The bigger this value the more items will be loaded
         * much earlier as you scroll to the bottom.
         */
        bufferValue: PropTypes.number,

        /**
         * The total number of items to be scrolled through
         */
        totalItems: PropTypes.number.isRequired,

        /**
         * The number of items to load in a single fetch
         */
        itemsPerPage: PropTypes.number.isRequired,

        /**
         * The current page that has been scrolled to
         */
        pageNumber: PropTypes.number.isRequired,

        /**
         * Optional style object that's passed on to the underlying loader
         * component
         */

        loaderStyle: PropTypes.object,
    };

    static defaultProps = {
        bufferValue: SCROLL_BUFFER,
        endOfDataMessage: '',
        styleClass: '',
        loaderStyle: {},
    };

    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            isEndofData: false,
        };
        this.node = React.createRef();
    }

    componentDidMount() {
        this.node.current.addEventListener('scroll', this.debounceHandleScroll);
    }

    componentWillUnmount() {
        this.node.current.removeEventListener('scroll', this.debounceHandleScroll);
    }

    validateBuffer = (buffer) => {
        if (buffer < SCROLL_BUFFER) {
            return SCROLL_BUFFER;
        }
        return Math.abs(buffer);
    }

    getAmountOfPages = (total, freq) => {
        return Math.ceil(total / freq);
    }

    handleScroll = () => {
        const {isFetching, isEndofData} = this.state;
        const {callBack, bufferValue, totalItems, itemsPerPage, pageNumber} = this.props;

        const node = this.node.current;
        const validBuffer = this.validateBuffer(bufferValue);

        const toScroll = node.scrollHeight - node.clientHeight - validBuffer;
        const nearBottom = node.scrollTop > toScroll;

        if (nearBottom && !isEndofData && !isFetching) {
            this.setState({isFetching: true},
                async () => {
                    await callBack();

                    this.setState({
                        isFetching: false,
                    });

                    if (totalItems === 0) {
                        this.setState({
                            isEndofData: true,
                        });
                        return;
                    }

                    const amountOfPages = this.getAmountOfPages(totalItems, itemsPerPage);

                    if (pageNumber === amountOfPages) {
                        this.setState({
                            isEndofData: true,
                        });
                    }
                });
        }
    }

    debounceHandleScroll = debounce(this.handleScroll, DEBOUNCE_WAIT_TIME);

    render() {
        const {children, endOfDataMessage, styleClass, loaderStyle} = this.props;
        const {isEndofData, isFetching} = this.state;
        const showLoader = !isEndofData && isFetching; // show loader if fetching and end of data is not reached.
        return (
            <>
                <div
                    className={`infinite-scroll ${styleClass}`}
                    ref={this.node}
                >
                    {children}
                    {showLoader && (
                        <LoadingScreen
                            style={loaderStyle}
                            message=' '
                        />
                    )}
                    {!showLoader && endOfDataMessage}
                </div>
            </>
        );
    }
}
