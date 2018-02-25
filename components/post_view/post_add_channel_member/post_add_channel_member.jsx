// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import store from 'stores/redux_store.jsx';
import {sendAddToChannelEphemeralPost} from 'actions/global_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import AtMention from 'components/at_mention';

const getState = store.getState;

export default class PostAddChannelMember extends React.PureComponent {
    static propTypes = {

        /*
        * Current user
        */
        currentUser: PropTypes.object.isRequired,

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
        userIds: PropTypes.array.isRequired,

        /*
        * usernames to add to channel
        */
        usernames: PropTypes.array.isRequired,

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
            removePost: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleAddChannelMember = () => {
        const {currentUser, team, channel, postId, userIds, usernames} = this.props;
        const post = this.props.actions.getPost(getState(), postId) || {};

        if (post.channel_id === channel.id) {
            userIds.forEach((userId, index) => {
                this.props.actions.addChannelMember(channel.id, userId);
                sendAddToChannelEphemeralPost(currentUser, usernames[index], channel.id, post.root_id);
            });

            this.props.actions.removePost(post);
        }

        browserHistory.push(`/${team.name}/channels/${channel.name}`);
    }

    generateAtMentions(usernames = []) {
        if (usernames.length === 1) {
            return (
                <AtMention mentionName={usernames[0]}/>
            );
        } else if (usernames.length > 1) {
            function andSeparator(key) {
                return (
                    <FormattedMessage
                        key={key}
                        id={'post_body.check_for_out_of_channel_mentions.link.and'}
                        defaultMessage={' and '}
                    />
                );
            }

            function commaSeparator(key) {
                return <span key={key}>{', '}</span>;
            }

            return (
                <span>
                    {
                        usernames.map((username) => {
                            return (
                                <AtMention
                                    key={username}
                                    mentionName={username}
                                />
                            );
                        }).reduce((acc, el, idx, arr) => {
                            if (idx === 0) {
                                return [el];
                            } else if (idx === arr.length - 1) {
                                return [...acc, andSeparator(idx), el];
                            }

                            return [...acc, commaSeparator(idx), el];
                        }, [])
                    }
                </span>
            );
        }

        return '';
    }

    render() {
        const {channel, usernames} = this.props;
        let linkId;
        let linkText;
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            linkId = 'post_body.check_for_out_of_channel_mentions.link.private';
            linkText = 'add them to this private channel';
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            linkId = 'post_body.check_for_out_of_channel_mentions.link.public';
            linkText = 'add them to the channel';
        }

        let messageId;
        let messageText;
        if (usernames.length === 1) {
            messageId = 'post_body.check_for_out_of_channel_mentions.message.one';
            messageText = 'was mentioned but is not in the channel. Would you like to ';
        } else if (usernames.length > 1) {
            messageId = 'post_body.check_for_out_of_channel_mentions.message.multiple';
            messageText = 'were mentioned but they are not in the channel. Would you like to ';
        }

        const atMentions = this.generateAtMentions(usernames);

        return (
            <p>
                {atMentions}
                {' '}
                <FormattedMessage
                    id={messageId}
                    defaultMessage={messageText}
                />
                <a
                    id='add_channel_member_link'
                    onClick={this.handleAddChannelMember}
                >
                    <FormattedMessage
                        id={linkId}
                        defaultMessage={linkText}
                    />
                </a>
                <FormattedMessage
                    id={'post_body.check_for_out_of_channel_mentions.message_last'}
                    defaultMessage={'? They will have access to all message history.'}
                />
            </p>
        );
    }
}
