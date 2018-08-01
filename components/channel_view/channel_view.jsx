// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as UserAgent from 'utils/user_agent.jsx';
import deferComponentRender from 'components/deferComponentRender';
import ChannelHeader from 'components/channel_header';
import CreatePost from 'components/create_post';
import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import PostView from 'components/post_view';
import TutorialView from 'components/tutorial';
import {clearMarks, mark, measure, trackEvent} from 'actions/diagnostics_actions.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {browserHistory} from 'utils/browser_history';
import TeamStore from 'stores/team_store.jsx';
import {Constants} from '../../utils/constants';

export default class ChannelView extends React.PureComponent {
    static propTypes = {

        /**
         * ID of the channel to display
         */
        channelId: PropTypes.string.isRequired,

        /**
         * Set if this channel is deactivated, primarily used for DMs with inactive users
         */
        deactivatedChannel: PropTypes.bool.isRequired,

        /**
         * Object from react-router
         */
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,

        /**
         * Set to show the tutorial
         */
        showTutorial: PropTypes.bool.isRequired,

        /**
         * Whether the channel is archived
         */
        channelIsArchived: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.createDeferredPostView();
    }

    createDeferredPostView = () => {
        this.deferredPostView = deferComponentRender(
            PostView,
            <div id='post-list'/>
        );
    }

    componentDidMount() {
        $('body').addClass('app__body');

        // IE Detection
        if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
            $('body').addClass('browser--ie');
        }
    }

    componentWillUnmount() {
        $('body').removeClass('app__body');
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.url !== nextProps.match.url) {
            this.createDeferredPostView();
        }
    }

    getChannelView = () => {
        return this.refs.channelView;
    }

    onClickCloseChannel = () => {
        browserHistory.push(`${TeamStore.getCurrentTeamRelativeUrl()}/channels/${Constants.DEFAULT_CHANNEL}`);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.channelId !== this.props.channelId || prevProps.channelIsArchived !== this.props.channelIsArchived) {
            mark('ChannelView#componentDidUpdate');

            const [dur1] = measure('SidebarChannelLink#click', 'ChannelView#componentDidUpdate');
            const [dur2] = measure('TeamLink#click', 'ChannelView#componentDidUpdate');

            clearMarks([
                'SidebarChannelLink#click',
                'ChannelView#componentDidUpdate',
                'TeamLink#click',
            ]);

            if (dur1 !== -1) {
                trackEvent('performance', 'channel_switch', {duration: Math.round(dur1)});
            }
            if (dur2 !== -1) {
                trackEvent('performance', 'team_switch', {duration: Math.round(dur2)});
            }
        }
    }

    render() {
        const {channelIsArchived} = this.props;
        if (this.props.showTutorial) {
            return (
                <TutorialView
                    isRoot={false}
                />
            );
        }

        let createPost;
        if (this.props.deactivatedChannel) {
            createPost = (
                <div
                    className='post-create-message'
                >
                    <FormattedMessage
                        id='create_post.deactivated'
                        defaultMessage='You are viewing an archived channel with a deactivated user.'
                    />
                </div>
            );
        } else {
            createPost = (
                <div
                    className='post-create__container'
                    id='post-create'
                >
                    {!channelIsArchived &&
                        <CreatePost
                            getChannelView={this.getChannelView}
                        />
                    }
                    {channelIsArchived &&
                        <div className='channel-archived__message'>
                            <FormattedMarkdownMessage
                                id='archivedChannelMessage'
                                defaultMessage='You are viewing an **archived channel**. New messages cannot be posted.'
                            />
                            <button
                                className='btn btn-primary channel-archived__close-btn'
                                onClick={this.onClickCloseChannel}
                            >
                                <FormattedMessage
                                    id='center_panel.archived.closeChannel'
                                    defaultMessage='Close Channel'
                                />
                            </button>
                        </div>
                    }
                </div>
            );
        }

        const DeferredPostView = this.deferredPostView;

        return (
            <div
                ref='channelView'
                id='app-content'
                className='app__content'
            >
                <FileUploadOverlay overlayType='center'/>
                <ChannelHeader
                    channelId={this.props.channelId}
                />
                <DeferredPostView
                    channelId={this.props.channelId}
                />
                {createPost}
            </div>
        );
    }
}
