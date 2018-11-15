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

        this.props.actions.onChannelByIdentifierEnter(props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.params.team !== nextProps.match.params.team ||
            this.props.match.params.identifier !== nextProps.match.params.identifier) {
            this.props.actions.onChannelByIdentifierEnter(nextProps);
        }
    }

    render() {
        return <ChannelView/>;
    }
}
