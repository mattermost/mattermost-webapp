// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {sendAddToChannelEphemeralPost} from 'actions/global_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import AtMention from 'components/at_mention';

export default class PostAddChannelMember extends React.PureComponent {
    static propTypes = {

        /*
        * Current user
        */
        currentUser: PropTypes.object.isRequired,

        /*
        * Type of current channel
        */
        channelType: PropTypes.string.isRequired,

        /*
        * ID of ephemeral post (at-mention's "add to channel" post)
        */
        postId: PropTypes.string.isRequired,

        /*
        * Ephemeral post (at-mention's "add to channel" post)
        */
        post: PropTypes.object.isRequired,

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
            * Function to remove post (ephemeral)
            */
            removePost: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleAddChannelMember = () => {
        const {currentUser, post, userIds, usernames} = this.props;

        if (post && post.channel_id) {
            let createAt = post.create_at;
            userIds.forEach((userId, index) => {
                createAt++;
                this.props.actions.addChannelMember(post.channel_id, userId);
                sendAddToChannelEphemeralPost(currentUser, usernames[index], userId, post.channel_id, post.root_id, createAt);
            });

            this.props.actions.removePost(post);
        }
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
        const {channelType, postId, usernames} = this.props;
        if (!postId || !channelType) {
            return null;
        }

        let linkId;
        let linkText;
        if (channelType === Constants.PRIVATE_CHANNEL) {
            linkId = 'post_body.check_for_out_of_channel_mentions.link.private';
            linkText = 'add them to this private channel';
        } else if (channelType === Constants.OPEN_CHANNEL) {
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
