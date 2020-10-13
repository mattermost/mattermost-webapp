// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import deferComponentRender from 'components/deferComponentRender';
import ChannelHeader from 'components/channel_header';
import CreatePost from 'components/create_post';
import FileUploadOverlay from 'components/file_upload_overlay';
import NextStepsView from 'components/next_steps_view';
import PostView from 'components/post_view';
import TutorialView from 'components/tutorial';
import {clearMarks, mark, measure, trackEvent} from 'actions/telemetry_actions.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class ChannelView extends React.PureComponent {
    static propTypes = {
        channelId: PropTypes.string.isRequired,
        deactivatedChannel: PropTypes.bool.isRequired,
        channelRolesLoading: PropTypes.bool.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
            params: PropTypes.shape({
                postid: PropTypes.string,
            }).isRequired,
        }).isRequired,
        showTutorial: PropTypes.bool.isRequired,
        showNextSteps: PropTypes.bool.isRequired,
        showNextStepsTips: PropTypes.bool.isRequired,
        isOnboardingHidden: PropTypes.bool.isRequired,
        showNextStepsEphemeral: PropTypes.bool.isRequired,
        channelIsArchived: PropTypes.bool.isRequired,
        viewArchivedChannels: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            goToLastViewedChannel: PropTypes.func.isRequired,
            setShowNextStepsView: PropTypes.func.isRequired,
            getProfiles: PropTypes.func.isRequired,
        }),
        isCloud: PropTypes.bool.isRequired,
    };

    static createDeferredPostView = () => {
        return deferComponentRender(
            PostView,
            <div
                id='post-list'
                className='a11y__region'
                data-a11y-sort-order='1'
                data-a11y-focus-child={true}
                data-a11y-order-reversed={true}
            />,
        );
    }

    static getDerivedStateFromProps(props, state) {
        let updatedState = {};
        const focusedPostId = props.match.params.postid;

        if (props.match.url !== state.url && props.channelId !== state.channelId) {
            updatedState = {deferredPostView: ChannelView.createDeferredPostView(), url: props.match.url, focusedPostId};
        }

        if (props.channelId !== state.channelId) {
            updatedState = {...updatedState, channelId: props.channelId, focusedPostId};
        }

        if (focusedPostId && focusedPostId !== state.focusedPostId) {
            updatedState = {...updatedState, focusedPostId};
        }

        if (props.showNextSteps !== state.showNextSteps) {
            updatedState = {...updatedState, showNextSteps: props.showNextSteps};
        }

        if (Object.keys(updatedState).length) {
            return updatedState;
        }

        return null;
    }

    constructor(props) {
        super(props);

        this.state = {
            url: props.match.url,
            channelId: props.channelId,
            deferredPostView: ChannelView.createDeferredPostView(),
        };

        this.channelViewRef = React.createRef();
    }

    getChannelView = () => {
        return this.channelViewRef.current;
    }

    onClickCloseChannel = () => {
        this.props.actions.goToLastViewedChannel();
    }

    async componentDidMount() {
        await this.props.actions.getProfiles();
        if ((this.props.showNextSteps || this.props.showNextStepsTips) && !this.props.isOnboardingHidden) {
            this.props.actions.setShowNextStepsView(true);
        }
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
            if (this.props.channelIsArchived && !this.props.viewArchivedChannels) {
                this.props.actions.goToLastViewedChannel();
            }
        }

        if (this.props.match.url !== prevProps.match.url && this.props.showNextStepsEphemeral) {
            this.props.actions.setShowNextStepsView(false);
        }
    }

    render() {
        const {channelIsArchived} = this.props;
        if (this.props.showTutorial && !this.props.isCloud) {
            return (
                <TutorialView
                    isRoot={false}
                />
            );
        }

        if (this.props.showNextStepsEphemeral && this.props.isCloud) {
            return (
                <NextStepsView/>
            );
        }

        let createPost;
        if (this.props.deactivatedChannel) {
            createPost = (
                <div
                    className='post-create__container'
                    id='post-create'
                >
                    <div
                        className='channel-archived__message'
                    >
                        <FormattedMarkdownMessage
                            id='create_post.deactivated'
                            defaultMessage='You are viewing an archived channel with a **deactivated user**. New messages cannot be posted.'
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
                </div>
            );
        } else if (channelIsArchived) {
            createPost = (
                <div
                    className='post-create__container'
                    id='post-create'
                >
                    <div
                        id='channelArchivedMessage'
                        className='channel-archived__message'
                    >
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
                </div>
            );
        } else if (!this.props.channelRolesLoading) {
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

        const DeferredPostView = this.state.deferredPostView;

        return (
            <div
                ref={this.channelViewRef}
                id='app-content'
                className='app__content'
            >
                <FileUploadOverlay overlayType='center'/>
                <ChannelHeader
                    channelId={this.props.channelId}
                />
                <DeferredPostView
                    channelId={this.props.channelId}
                    focusedPostId={this.state.focusedPostId}
                />
                {createPost}
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */
