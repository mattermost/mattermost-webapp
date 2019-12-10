// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import ChannelHeader from 'components/channel_header';
import LocalizedIcon from 'components/localized_icon';
import PostView from 'components/post_view';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import Constants from 'utils/constants.jsx';
import {t} from 'utils/i18n';
import * as Utils from 'utils/utils.jsx';

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

    static getDerivedStateFromProps(props, state) {
        let updatedState = {postid: props.match.params.postid};
        if (state.postid !== props.match.params.postid) {
            updatedState = {...updatedState, valid: false};
        }

        return updatedState;
    }

    constructor(props) {
        super(props);
        this.state = {valid: false};

        this.permalink = React.createRef();
    }

    componentDidMount() {
        this.doPermalinkEvent(this.props);
        document.body.classList.add('app__body');

        window.addEventListener('keydown', this.onShortcutKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onShortcutKeyDown);
    }

    componentDidUpdate() {
        if (!this.state.valid) {
            this.doPermalinkEvent(this.props);
        }
    }

    doPermalinkEvent = async (props) => {
        const postId = props.match.params.postid;
        await this.props.actions.focusPost(postId, this.props.returnTo);
        this.setState({valid: true});
    }

    isStateValid = () => {
        return this.state.valid && this.props.channelId && this.props.teamName;
    }

    onShortcutKeyDown = (e) => {
        if (e.shiftKey && Utils.cmdOrCtrlPressed(e) && Utils.isKeyPressed(e, Constants.KeyCodes.L) && this.permalink.current) {
            this.permalink.current.focus();
        }
    }

    render() {
        const {
            channelId,
            channelName,
            channelIsArchived,
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
                <div
                    id='archive-link-home'
                >
                    <Link
                        to={'/' + teamName + '/channels/' + channelName}
                        className='a11y__region'
                        data-a11y-sort-order='2'
                        innerRef={this.permalink}
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
                        <LocalizedIcon
                            className='fa fa-arrow-down'
                            title={{id: t('center_panel.recent.icon'), defaultMessage: 'Jump to recent messages Icon'}}
                        />
                    </Link>
                </div>
            </div>
        );
    }
}
