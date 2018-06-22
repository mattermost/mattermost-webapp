// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import ChannelHeader from 'components/channel_header';
import {localizeMessage} from 'utils/utils.jsx';
import PostView from 'components/post_view';
import {emitPostFocusEvent} from 'actions/global_actions.jsx';

export default class PermalinkView extends React.PureComponent {
    static propTypes = {
        channelId: PropTypes.string,
        channelName: PropTypes.string,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                postid: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        returnTo: PropTypes.string.isRequired,
        teamName: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {valid: false};
    }

    componentDidMount() {
        this.doPermalinkEvent(this.props);
        document.body.classList.add('app__body');
    }

    componentWillUnmount() {
        document.body.classList.remove('app__body');
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.params.postid !== nextProps.match.params.postid) {
            this.doPermalinkEvent(nextProps);
        }
    }

    doPermalinkEvent = async (props) => {
        this.setState({valid: false});
        const postId = props.match.params.postid;
        await emitPostFocusEvent(postId, this.props.returnTo);
        this.setState({valid: true});
    }

    isStateValid = () => {
        return this.state.valid && this.props.channelId && this.props.teamName;
    }

    render() {
        const {
            channelId,
            channelName,
            match,
            teamName,
        } = this.props;

        if (!this.isStateValid()) {
            return (
                <div
                    id='app-content'
                    className='app__content'
                />
            );
        }

        return (
            <div
                id='app-content'
                className='app__content'
            >
                <ChannelHeader
                    channelId={channelId}
                />
                <PostView
                    channelId={channelId}
                    focusedPostId={match.params.postid}
                />
                <div id='archive-link-home'>
                    <Link
                        to={'/' + teamName + '/channels/' + channelName}
                    >
                        <FormattedMessage
                            id='center_panel.recent'
                            defaultMessage='Click here to jump to recent messages. '
                        />
                        <i
                            className='fa fa-arrow-down'
                            title={localizeMessage('center_panel.recent.icon', 'Jump to recent messages Icon')}
                        />
                    </Link>
                </div>
            </div>
        );
    }
}
