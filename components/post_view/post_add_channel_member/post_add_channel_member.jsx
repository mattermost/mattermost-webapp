// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {sendAddToChannelEphemeralPost} from 'actions/global_actions.jsx';
import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';
import AtMention from 'components/at_mention';

export default class PostAddChannelMember extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
        };
    }

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

        noGroupsUsernames: PropTypes.array.isRequired,

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

    expand = () => {
        this.setState({expanded: true});
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

            if (this.state.expanded || usernames.length <= 3) {
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
            const otherUsers = [...usernames];
            const firstUserName = otherUsers.shift();
            const lastUserName = otherUsers.pop();
            return (
                <span>
                    <AtMention
                        key={firstUserName}
                        mentionName={firstUserName}
                    />
                    {commaSeparator(1)}
                    <a
                        className='PostBody_otherUsersLink'
                        onClick={this.expand}
                    >
                        <FormattedMessage
                            id={'post_body.check_for_out_of_channel_mentions.others'}
                            defaultMessage={'{numOthers} others'}
                            values={{
                                numOthers: otherUsers.length,
                            }}
                        />
                    </a>
                    {andSeparator(1)}
                    <AtMention
                        key={lastUserName}
                        mentionName={lastUserName}
                    />
                </span>
            );
        }

        return '';
    }

    render() {
        const {channelType, postId, usernames, noGroupsUsernames} = this.props;
        if (!postId || !channelType) {
            return null;
        }

        let linkId;
        let linkText;
        if (channelType === Constants.PRIVATE_CHANNEL) {
            linkId = t('post_body.check_for_out_of_channel_mentions.link.private');
            linkText = 'add them to this private channel';
        } else if (channelType === Constants.OPEN_CHANNEL) {
            linkId = t('post_body.check_for_out_of_channel_mentions.link.public');
            linkText = 'add them to the channel';
        }

        let outOfChannelMessageID;
        let outOfChannelMessageText;
        const outOfChannelAtMentions = this.generateAtMentions(usernames);
        if (usernames.length === 1) {
            outOfChannelMessageID = t('post_body.check_for_out_of_channel_mentions.message.one');
            outOfChannelMessageText = 'did not get notified by this mention because they are not in the channel. Would you like to ';
        } else if (usernames.length > 1) {
            outOfChannelMessageID = t('post_body.check_for_out_of_channel_mentions.message.multiple');
            outOfChannelMessageText = 'did not get notified by this mention because they are not in the channel. Would you like to ';
        }

        let outOfGroupsMessageID;
        let outOfGroupsMessageText;
        const outOfGroupsAtMentions = this.generateAtMentions(noGroupsUsernames);
        if (noGroupsUsernames.length) {
            outOfGroupsMessageID = t('post_body.check_for_out_of_channel_groups_mentions.message');
            outOfGroupsMessageText = 'did not get notified by this mention because they are not in the channel. They cannot be added to the channel because they are not a member of the linked groups. To add them to this channel, they must be added to the linked groups.';
        }

        var outOfChannelMessage = null;
        var outOfGroupsMessage = null;

        if (usernames.length) {
            outOfChannelMessage = (
                <p>
                    {outOfChannelAtMentions}
                    {' '}
                    <FormattedMessage
                        id={outOfChannelMessageID}
                        defaultMessage={outOfChannelMessageText}
                    />
                    <a
                        className='PostBody_addChannelMemberLink'
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

        if (noGroupsUsernames.length) {
            outOfGroupsMessage = (
                <p>
                    {outOfGroupsAtMentions}
                    {' '}
                    <FormattedMessage
                        id={outOfGroupsMessageID}
                        defaultMessage={outOfGroupsMessageText}
                    />
                </p>
            );
        }

        return (
            <>
                {outOfChannelMessage}
                {outOfGroupsMessage}
            </>
        );
    }
}
