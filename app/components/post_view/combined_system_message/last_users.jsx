// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl} from 'react-intl';

import {Posts} from 'mattermost-redux/constants';

import {t} from 'utils/i18n';
import {intlShape} from 'utils/react_intl';

import Markdown from 'components/markdown';

const typeMessage = {
    [Posts.POST_TYPES.ADD_TO_CHANNEL]: {
        id: t('last_users_message.added_to_channel.type'),
        defaultMessage: 'were **added to the channel** by {actor}.',
    },
    [Posts.POST_TYPES.JOIN_CHANNEL]: {
        id: t('last_users_message.joined_channel.type'),
        defaultMessage: '**joined the channel**.',
    },
    [Posts.POST_TYPES.LEAVE_CHANNEL]: {
        id: t('last_users_message.left_channel.type'),
        defaultMessage: '**left the channel**.',
    },
    [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: {
        id: t('last_users_message.removed_from_channel.type'),
        defaultMessage: 'were **removed from the channel**.',
    },
    [Posts.POST_TYPES.ADD_TO_TEAM]: {
        id: t('last_users_message.added_to_team.type'),
        defaultMessage: 'were **added to the team** by {actor}.',
    },
    [Posts.POST_TYPES.JOIN_TEAM]: {
        id: t('last_users_message.joined_team.type'),
        defaultMessage: '**joined the team**.',
    },
    [Posts.POST_TYPES.LEAVE_TEAM]: {
        id: t('last_users_message.left_team.type'),
        defaultMessage: '**left the team**.',
    },
    [Posts.POST_TYPES.REMOVE_FROM_TEAM]: {
        id: t('last_users_message.removed_from_team.type'),
        defaultMessage: 'were **removed from the team**.',
    },
};

class LastUsers extends React.PureComponent {
    static propTypes = {
        actor: PropTypes.string,
        expandedLocale: PropTypes.object.isRequired,
        formatOptions: PropTypes.object.isRequired,
        intl: intlShape.isRequired,
        postType: PropTypes.string.isRequired,
        usernames: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            expand: false,
        };
    }

    handleOnClick = (e) => {
        e.preventDefault();

        this.setState({expand: true});
    }

    renderMessage = (formattedMessage) => {
        return (
            <Markdown
                message={formattedMessage}
                options={this.props.formatOptions}
            />
        );
    }

    render() {
        const {formatMessage} = this.props.intl;
        const {expand} = this.state;
        const {
            actor,
            expandedLocale,
            postType,
            usernames,
        } = this.props;

        const firstUser = usernames[0];
        const lastIndex = usernames.length - 1;
        const lastUser = usernames[lastIndex];

        if (expand) {
            const formattedMessage = formatMessage(expandedLocale, {
                users: usernames.slice(0, lastIndex).join(', '),
                lastUser,
                actor,
            });

            return this.renderMessage(formattedMessage);
        }

        const firstUserMessage = formatMessage(
            {id: 'last_users_message.first', defaultMessage: '{firstUser} and '},
            {firstUser},
        );

        const otherUsersMessage = formatMessage(
            {id: 'last_users_message.others', defaultMessage: '{numOthers} others '},
            {numOthers: lastIndex},
        );

        const actorMessage = formatMessage(
            {id: typeMessage[postType].id, defaultMessage: typeMessage[postType].defaultMessage},
            {actor},
        );

        return (
            <span>
                {this.renderMessage(firstUserMessage)}
                <a onClick={this.handleOnClick}>
                    {otherUsersMessage}
                </a>
                {this.renderMessage(actorMessage)}
            </span>
        );
    }
}

export default injectIntl(LastUsers);
