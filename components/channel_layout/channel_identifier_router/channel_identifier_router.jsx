// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ChannelView from 'components/channel_view/index';

export default class ChannelIdentifierRouter extends React.PureComponent {
    static propTypes = {

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,

        actions: PropTypes.shape({
            onChannelByIdentifierEnter: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            prevProps: props,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.team !== prevProps.match.params.team ||
            this.props.match.params.identifier !== prevProps.match.params.identifier) {
            this.props.actions.onChannelByIdentifierEnter(this.props);
        }
    }
    componentDidMount() {
        this.props.actions.onChannelByIdentifierEnter(this.props);
    }
    render() {
        return <ChannelView/>;
    }
}
