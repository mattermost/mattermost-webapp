// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';
import {Link} from 'react-router-dom';

import {getMyTeams, getTeam, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getPreviousTeamId} from 'selectors/local_storage';

import {GlobalState} from 'types/store';

import {getDisplayName} from 'utils/utils';

import SimpleTooltip from 'components/widgets/simple_tooltip/simple_tooltip';

import {UserProfile} from '@mattermost/types/users';

const SendMessage = styled(Link)`
    display: inline-flex;
    border: 0;
    border-radius: 4px;
    place-items: center;

    .icon {
        margin-right: 3px;
        font-size: 14.4px;
    }
`;

type SendMessageProps = {
    user: UserProfile;
}

const SendMessageButton = ({user}: SendMessageProps) => {
    const {formatMessage} = useIntl();
    const dmChannelRoute = useSelector((state: GlobalState) => {
        const prevTeamId = getPreviousTeamId(state);
        const team = getCurrentTeam(state) ?? (prevTeamId && getTeam(state, prevTeamId)) ?? getMyTeams(state)?.[0];
        return `/${team.name}/messages/@${user.username}`;
    });

    return (
        <SimpleTooltip
            id={`send_message_tooltip_${user.id}`}
            content={(
                <FormattedMessage
                    id='people.profile_card.message_user'
                    defaultMessage='Message {user}'
                    values={{user: getDisplayName(user)}}
                />
            )}
        >
            <SendMessage
                className='btn style--none btn-primary'
                to={dmChannelRoute}
            >
                <i className='icon icon-send'/>
                {formatMessage({id: 'people.teams.message', defaultMessage: 'Message'})}
            </SendMessage>
        </SimpleTooltip>
    );
};

export default SendMessageButton;
