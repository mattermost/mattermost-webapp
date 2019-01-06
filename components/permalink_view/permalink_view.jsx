// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, intlShape} from 'react-intl';
import {Link} from 'react-router-dom';

import ChannelHeader from 'components/channel_header';
import PostView from 'components/post_view';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class PermalinkView extends React.PureComponent {
    static propTypes = {
        channelId: PropTypes.string,
        channelName: PropTypes.string,
        channelIsArchived: PropTypes.bool,

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
        actions: PropTypes.shape({
            focusPost: PropTypes.func.isRequired,
        }).isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
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
        await this.props.actions.focusPost(postId, this.props.returnTo);
        this.setState({valid: true});
    }

    isStateValid = () => {
        return this.state.valid && this.props.channelId && this.props.teamName;
    }

    render() {
        const {
            channelId,
            channelName,
            channelIsArchived,
            match,
            teamName,
        } = this.props;
        const {formatMessage} = this.context.intl;

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
                        {channelIsArchived &&
                            <FormattedMarkdownMessage
                                id='center_panel.permalink.archivedChannel'
                                defaultMessage='You are viewing an **archived channel**. '
                            />
                        }
                        <FormattedMessage
                            id='center_panel.recent'
                            defaultMessage='Click here to jump to recent messages. '
                        />
                        <i
                            className='fa fa-arrow-down'
                            title={formatMessage({id: 'center_panel.recent.icon', defaultMessage: 'Jump to recent messages Icon'})}
                        />
                    </Link>
                </div>
            </div>
        );
    }
}
