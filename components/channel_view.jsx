// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import ChannelStore from 'stores/channel_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import UserStore from 'stores/user_store.jsx';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import ChannelHeader from 'components/channel_header';
import CreatePost from 'components/create_post';
import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import PostView from 'components/post_view';
import TutorialView from 'components/tutorial/tutorial_view.jsx';

const TutorialSteps = Constants.TutorialSteps;
const Preferences = Constants.Preferences;

export default class ChannelView extends React.Component {
    constructor(props) {
        super(props);

        this.getStateFromStores = this.getStateFromStores.bind(this);
        this.isStateValid = this.isStateValid.bind(this);
        this.updateState = this.updateState.bind(this);

        this.state = this.getStateFromStores(props);
    }

    getStateFromStores() {
        return {
            channelId: ChannelStore.getCurrentId(),
            tutorialStep: PreferenceStore.getInt(Preferences.TUTORIAL_STEP, UserStore.getCurrentId(), 999)
        };
    }

    isStateValid() {
        return this.state.channelId !== '';
    }

    updateState() {
        this.setState(this.getStateFromStores(this.props));
    }

    componentDidMount() {
        ChannelStore.addChangeListener(this.updateState);

        $('body').addClass('app__body');

        // IE Detection
        if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
            $('body').addClass('browser--ie');
        }
    }

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.updateState);

        $('body').removeClass('app__body');
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.getStateFromStores(nextProps));
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextProps.params, this.props.params)) {
            return true;
        }

        if (nextState.channelId !== this.state.channelId) {
            return true;
        }

        return false;
    }

    getChannelView = () => {
        return this.refs.channelView;
    }

    render() {
        if (this.state.tutorialStep <= TutorialSteps.INTRO_SCREENS) {
            return (
                <TutorialView
                    isRoot={false}
                />
            );
        }

        let createPost = (
            <div
                className='post-create__container'
                id='post-create'
            >
                <CreatePost
                    getChannelView={this.getChannelView}
                />
            </div>
        );
        const channel = ChannelStore.get(this.state.channelId);
        if (channel && channel.type === Constants.DM_CHANNEL) {
            const teammate = Utils.getDirectTeammate(channel.id);
            if (teammate && teammate.delete_at) {
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
            }
        }

        return (
            <div
                ref='channelView'
                id='app-content'
                className='app__content'
            >
                <FileUploadOverlay overlayType='center'/>
                <ChannelHeader
                    channelId={this.state.channelId}
                />
                <PostView
                    channelId={this.state.channelId}
                />
                {createPost}
            </div>
        );
    }
}
ChannelView.defaultProps = {
};

ChannelView.propTypes = {
    params: PropTypes.object.isRequired
};
