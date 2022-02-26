// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import Constants from 'utils/constants';
import useCopyText from 'components/common/hooks/useCopyText';

const ChannelInfoRhsTopButtons = styled.div`
    display: flex;
    color: rgba(63, 67, 80, 0.56);
    margin-top: 24px;
    padding: 0 18px;
    font-family: Open Sans;
`;

const ChannelInfoRhsTopButton = styled.button`
    border-radius: 4px;
    border: 0;
    padding: 12px 0 10px 0;
    background: rgba(63, 67, 80, 0.04);
    flex: 1;
    margin: 0 6px;
    transition: background-color 0.5s ease;

    &:hover {
       background: rgba(63, 67, 80, 0.08);
       color: rgba(63, 67, 80, 0.72);
    }

    &.active {
        background: rgba(28, 88, 217, 0.08);
        color: #1C58D9;
    }

    &.success {
        background: #3DB887;
        color: #FFFFFF;
    }

    & i {
        font-size: 24px;
    }
    & span {
        line-height: 16px;
        font-size: 10px;
        font-weight: 600;
    }
`;

interface Props {
    channelType: string;
    channelURL?: string;

    isFavorite: boolean;
    isMuted: boolean;
    isInvitingPeople: boolean;

    toggleFavorite: () => void;
    toggleMute: () => void;
    addPeople: () => void;
}

export default function TopButtons({channelType, channelURL, isFavorite, isMuted, isInvitingPeople, ...props}: Props) {
    const {formatMessage} = useIntl();

    const copyLink = useCopyText({
        text: channelURL || '',
        successCopyTimeout: 2 * 1000,
    });

    const canAddPeople = [Constants.OPEN_CHANNEL, Constants.PRIVATE_CHANNEL, Constants.GM_CHANNEL].includes(channelType);

    const canCopyLink = [Constants.OPEN_CHANNEL, Constants.PRIVATE_CHANNEL].includes(channelType);

    // Favorite Button State
    const favoriteIcon = isFavorite ? 'icon-star' : 'icon-star-outline';
    const favoriteText = isFavorite ? formatMessage({id: 'TEMP.favd', defaultMessage: 'Favorited'}) : formatMessage({id: 'TEMP.fav', defaultMessage: 'Favorite'});

    // Mute Button State
    const mutedIcon = isMuted ? 'icon-bell-off-outline' : 'icon-bell-outline';
    const mutedText = isMuted ? formatMessage({id: 'TEMP.mutd', defaultMessage: 'Muted'}) : formatMessage({id: 'TEMP.mut', defaultMessage: 'Mute'});

    // Copy Button State
    const copyIcon = copyLink.copiedRecently ? 'icon-check' : 'icon-link-variant';
    const copyText = copyLink.copiedRecently ? formatMessage({id: 'TEMP.copd', defaultMessage: 'Copied'}) : formatMessage({id: 'TEMP.cop', defaultMessage: 'Copy Link'});

    const toggleFavorite = () => {
        props.toggleFavorite();
    };

    const toggleMute = () => {
        props.toggleMute();
    };

    return (
        <ChannelInfoRhsTopButtons>
            <ChannelInfoRhsTopButton
                onClick={toggleFavorite}
                className={isFavorite ? 'active' : ''}
            >
                <div>
                    <i className={'icon ' + favoriteIcon}/>
                </div>
                <span>{favoriteText}</span>
            </ChannelInfoRhsTopButton>
            <ChannelInfoRhsTopButton
                onClick={toggleMute}
                className={isMuted ? 'active' : ''}
            >
                <div>
                    <i className={'icon ' + mutedIcon}/>
                </div>
                <span>{mutedText}</span>
            </ChannelInfoRhsTopButton>
            {canAddPeople && (
                <ChannelInfoRhsTopButton
                    onClick={props.addPeople}
                    className={isInvitingPeople ? 'active' : ''}
                >
                    <div>
                        <i className='icon icon-account-plus-outline'/>
                    </div>
                    <span>Add People</span>
                </ChannelInfoRhsTopButton>
            )}
            {canCopyLink && (
                <ChannelInfoRhsTopButton
                    onClick={copyLink.onClick}
                    className={copyLink.copiedRecently ? 'success' : ''}
                >
                    <div>
                        <i className={'icon ' + copyIcon}/>
                    </div>
                    <span>{copyText}</span>
                </ChannelInfoRhsTopButton>
            )}
        </ChannelInfoRhsTopButtons>
    );
}
