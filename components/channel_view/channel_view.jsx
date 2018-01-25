// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {joinChannel} from 'mattermost-redux/actions/channels';

import * as UserAgent from 'utils/user_agent.jsx';
import deferComponentRender from 'components/deferComponentRender';
import Constants from 'utils/constants.jsx';
import ChannelStore from 'stores/channel_store';
import UserStore from 'stores/user_store';
import TeamStore from 'stores/team_store';
import {loadNewDMIfNeeded, loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import ChannelHeader from 'components/channel_header';
import CreatePost from 'components/create_post';
import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import PostView from 'components/post_view';
import TutorialView from 'components/tutorial/tutorial_view.jsx';
import {clearMarks, mark, measure, trackEvent} from 'actions/diagnostics_actions.jsx';
import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

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
         * Set to show the tutorial
         */
        showTutorial: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.updateChannel(this.props);

        this.createDeferredPostView();
    }

    createDeferredPostView = () => {
        this.deferredPostView = deferComponentRender(
            PostView,
            <div id='post-list'/>
        );
    }

    updateChannel(props) {
        let channel;
        const fakechannel = (new URLSearchParams(props.location.search)).get('fakechannel');
        if (fakechannel) {
            channel = JSON.parse(fakechannel);
        } else {
            channel = ChannelStore.getByName(props.match.params.channel);

            if (channel && channel.type === Constants.DM_CHANNEL) {
                loadNewDMIfNeeded(channel.id);
            } else if (channel && channel.type === Constants.GM_CHANNEL) {
                loadNewGMIfNeeded(channel.id);
            }

            if (channel) {
                GlobalActions.emitChannelClickEvent(channel);
            } else {
                joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), null, props.match.params.channel)(dispatch, getState).then(
                    (result) => {
                        if (result.data) {
                            channel = result.data.channel;
                            if (channel && channel.type === Constants.DM_CHANNEL) {
                                loadNewDMIfNeeded(channel.id);
                            } else if (channel && channel.type === Constants.GM_CHANNEL) {
                                loadNewGMIfNeeded(channel.id);
                            }
                            GlobalActions.emitChannelClickEvent(channel);
                        } else if (result.error) {
                            if (props.match.params.team) {
                                props.history.push('/' + props.match.params.team + '/channels/town-square');
                            } else {
                                props.history.push('/');
                            }
                        }
                    }
                );
            }
        }
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

    componentWillReceiveProps(nextProps) {
        if (this.props.match.url !== nextProps.match.url) {
            this.updateChannel(nextProps);
            this.createDeferredPostView();
        }
    }

    getChannelView = () => {
        return this.refs.channelView;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.channelId !== this.props.channelId) {
            mark('ChannelView#componentDidUpdate');

            const [dur1] = measure('SidebarChannelLink#click', 'ChannelView#componentDidUpdate');
            const [dur2] = measure('TeamLink#click', 'ChannelView#componentDidUpdate');

            clearMarks([
                'SidebarChannelLink#click',
                'ChannelView#componentDidUpdate',
                'TeamLink#click'
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
                    <CreatePost
                        getChannelView={this.getChannelView}
                    />
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
