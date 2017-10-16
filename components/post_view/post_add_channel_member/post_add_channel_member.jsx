// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {browserHistory} from 'react-router/es6';

import store from 'stores/redux_store.jsx';

const getState = store.getState;

export default class PostAddChannelMember extends React.PureComponent {
    static propTypes = {

        /*
        * Current team
        */
        team: PropTypes.object.isRequired,

        /*
        * Current channel
        */
        channel: PropTypes.object.isRequired,

        /*
        * post id of an ephemeral message
        */
        postId: PropTypes.string.isRequired,

        /*
        * user ids to add to channel
        */
        userIds: PropTypes.string.isRequired,

        /*
        * localization of a text/phrase
        */
        localizationId: PropTypes.string.isRequired,

        actions: PropTypes.shape({

            /*
            * Function to add members to channel
            */
            addChannelMember: PropTypes.func.isRequired,

            /*
            * Function to get post (ephemeral)
            */
            getPost: PropTypes.func.isRequired,

            /*
            * Function to remove post (ephemeral)
            */
            removePost: PropTypes.func.isRequired
        }).isRequired
    }

    handleAddChannelMember = () => {
        const {team, channel, postId, userIds} = this.props;
        const post = this.props.actions.getPost(getState(), postId) || {};

        if (post.channel_id === channel.id) {
            userIds.split('-').forEach((userId) => {
                this.props.actions.addChannelMember(channel.id, userId);
            });

            this.props.actions.removePost(post);
        }

        browserHistory.push(`/${team.name}/channels/${channel.name}`);
    }

    render() {
        let defaultMessage = 'add them to the channel';
        if (this.props.localizationId === 'post_body.check_for_out_of_channel_mentions.link.private') {
            defaultMessage = 'add them to this private channel';
        }

        return (
            <a
                id='add_channel_member_link'
                onClick={this.handleAddChannelMember}
            >
                <FormattedMessage
                    id={this.props.localizationId}
                    defaultMessage={defaultMessage}
                />
            </a>
        );
    }
}
