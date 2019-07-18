// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

export default class Infinity extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,

        /**
         * Function to that is called to load more items
         */
        callBack: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
        };
        this.node = React.createRef();
    }

    componentDidMount() {
        this.node.current.addEventListener('scroll', this.handleScroll.bind(this));
    }

    componentWillUnmount() {
        this.node.current.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.children === nextProps.children) {
            return;
        }

        this.setState({
            isFetching: false,
        });
    }

    handleScroll = (event) => {
        const {callBack} = this.props;
        var node = event.target;
        const bottom = node.scrollHeight - node.scrollTop === node.clientHeight;
        if (bottom) {
            this.setState({
                isFetching: true,
            });
            callBack();
        }
    }

    render() {
        const {children} = this.props;
        const {isFetching} = this.state;
        return (
            <div>
                <div
                    style={{overflowY: 'scroll', maxHeight: 'inherit'}}
                    ref={this.node}
                >
                    {children}
                </div>
                {isFetching && 'Fetching more list items...'}
            </div>
        );
    }
}