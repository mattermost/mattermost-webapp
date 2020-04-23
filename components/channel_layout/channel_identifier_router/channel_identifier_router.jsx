// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ChannelView from 'components/channel_view/index';
import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';

export default class ChannelIdentifierRouter extends React.PureComponent {
    static propTypes = {

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
                postid: PropTypes.string,
            }).isRequired,
            url: PropTypes.string.isRequired,
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
            clearTimeout(this.replaceUrlTimeout);
            this.props.actions.onChannelByIdentifierEnter(this.props);
            this.replaceUrlIfPermalink();
        }
    }
    componentDidMount() {
        this.props.actions.onChannelByIdentifierEnter(this.props);
        this.replaceUrlIfPermalink();
    }

    componentWillUnmount() {
        clearTimeout(this.replaceUrlTimeout);
    }

    replaceUrlIfPermalink = () => {
        if (this.props.match.params.postid) {
            this.replaceUrlTimeout = setTimeout(() => {
                const channelUrl = this.props.match.url.split('/').slice(0, -1).join('/');
                browserHistory.replace(channelUrl);
            }, Constants.PERMALINK_FADEOUT);
        }
    }

    render() {
        return <ChannelView/>;
    }
}
