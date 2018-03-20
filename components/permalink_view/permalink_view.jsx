// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import ChannelHeader from 'components/channel_header';
import PostView from 'components/post_view';
import * as GlobalActions from 'actions/global_actions.jsx';

import {Constants, ErrorPageTypes} from 'utils/constants.jsx';

const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;

export default class PermalinkView extends React.PureComponent {
    static propTypes = {
        returnTo: PropTypes.string.isRequired,
        currentTeam: PropTypes.object,
        currentChannel: PropTypes.object,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                postid: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,

        actions: PropTypes.shape({
            getPostThread: PropTypes.func,
            getPostsAfter: PropTypes.func,
            getPostsBefore: PropTypes.func,
        }),
    };

    constructor(props) {
        super(props);
        this.doPermalinkEvent = this.doPermalinkEvent.bind(this);

        if (props.currentChannel) {
            //does currentChannel always represent present permaview channel?
            this.state = {
                channelInfo: props.currentChannel,
            };
        } else {
            this.state = {
                channelInfo: null,
            };
        }
        this.state = {
            postsLoaded: false,
        };
    }

    doPermalinkEvent(props, posts) {
        const postId = props.match.params.postid;
        GlobalActions.emitPostFocusEvent(postId, posts);
    }

    componentDidMount() {
        this.loadPermaViewData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if ((!this.props.currentChannel && nextProps.currentChannel) || (this.props.match.url !== nextProps.match.url)) {
            this.loadPermaViewData(nextProps);
        }
    }

    loadPermaViewData = async (props) => {
        let channelId;

        this.setState({
            channelInfo: props.currentChannel,
            postsLoaded: false,
        });
        const getPostThreadAsync = this.props.actions.getPostThread(props.match.params.postid, false);
        const {data} = await getPostThreadAsync;
        if (data) {
            channelId = data.posts[data.order[0]].channel_id;
            const getPostsBeforeAsync = this.props.actions.getPostsBefore(channelId, props.match.params.postid, 0, POSTS_PER_PAGE);
            const getPostsAfterAsync = this.props.actions.getPostsAfter(channelId, props.match.params.postid, 0, POSTS_PER_PAGE);
            await getPostsAfterAsync;
            await getPostsBeforeAsync;
        } else {
            this.props.history.push(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${this.props.returnTo}`);
        }

        this.setState({
            postsLoaded: true,
        });
        this.doPermalinkEvent(props, data);
    }

    render() {
        if (!this.state.channelInfo) {
            return null;
        }
        if (!this.state.postsLoaded) {
            return null;
        }
        return (
            <div
                id='app-content'
                className='app__content'
            >
                <ChannelHeader
                    channelId={this.props.currentChannel.id}
                />
                <PostView
                    channelId={this.props.currentChannel.id}
                    focusedPostId={this.props.match.params.postid}
                />
                <div
                    id='archive-link-home'
                >
                    <Link
                        to={'/' + this.props.currentTeam.name + '/channels/' + this.props.currentChannel.name}
                    >
                        <FormattedMessage
                            id='center_panel.recent'
                            defaultMessage='Click here to jump to recent messages. '
                        />
                        <i className='fa fa-arrow-down'/>
                    </Link>
                </div>
            </div>
        );
    }
}
