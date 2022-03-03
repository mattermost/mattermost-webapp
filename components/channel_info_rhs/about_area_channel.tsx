// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {FormattedMessage, useIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import Markdown from 'components/markdown';

import LineLimiter from './components/linelimiter';
import EditableArea from './components/EditableArea';

const ChannelLink = styled.div`
    margin-bottom: 12px;
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 0.02em;
`;

const ChannelPurpose = styled.div`
    margin-bottom: 12px;
    &.ChannelPurpose--is-dm {
        margin-bottom: 16px;
    }
`;

const ChannelHeader = styled.div`
    margin-bottom: 12px;
`;

const EmptyPlace = styled.div`
    padding: 0px;
    background: transparent;
    border: 0px;
    color: rgba(var(--center-channel-text-rgb), 0.64);
`;

interface Props {
    channel: Channel;
    channelURL: string;
    canEditChannelProperties: boolean;
    actions: {
        editChannelPurpose: () => void;
        editChannelHeader: () => void;
    };
}

const AboutAreaChannel = ({channel, channelURL, canEditChannelProperties, actions}: Props) => {
    const {formatMessage} = useIntl();

    return (
        <>

            <ChannelPurpose>
                <EditableArea
                    editable={canEditChannelProperties}
                    content={channel.purpose ? (
                        <LineLimiter
                            maxLines={3}
                            lineHeight={20}
                            moreText={formatMessage({id: 'channel_info_rhs.about_area.channel_purpose.line_limiter.more', defaultMessage: '... more'})}
                            lessText={formatMessage({id: 'channel_info_rhs.about_area.channel_purpose.line_limiter.less', defaultMessage: 'less'})}
                        >
                            <Markdown message={channel.purpose}/>
                        </LineLimiter>
                    ) : (
                        <EmptyPlace>
                            {canEditChannelProperties ? (
                                <FormattedMessage
                                    id='channel_info_rhs.about_area.add_channel_purpose'
                                    defaultMessage='Add a channel purpose'
                                />
                            ) : (
                                <FormattedMessage
                                    id='channel_info_rhs.about_area.no_channel_purpose'
                                    defaultMessage='No channel purpose'
                                />

                            )}
                        </EmptyPlace>
                    )}
                    onEdit={actions.editChannelPurpose}
                />
            </ChannelPurpose>

            <ChannelHeader>
                <EditableArea
                    content={channel.header ? (
                        <LineLimiter
                            maxLines={3}
                            lineHeight={20}
                            moreText={formatMessage({id: 'channel_info_rhs.about_area.channel_header.line_limiter.more', defaultMessage: '... more'})}
                            lessText={formatMessage({id: 'channel_info_rhs.about_area.channel_header.line_limiter.less', defaultMessage: 'less'})}
                        >
                            <Markdown message={channel.header}/>
                        </LineLimiter>
                    ) : (
                        <EmptyPlace>
                            {canEditChannelProperties ? (
                                <FormattedMessage
                                    id='channel_info_rhs.about_area.add_channel_header'
                                    defaultMessage='Add a channel header'
                                />
                            ) : (
                                <FormattedMessage
                                    id='channel_info_rhs.about_area.no_channel_header'
                                    defaultMessage='No channel header'
                                />

                            )}
                        </EmptyPlace>
                    )}
                    editable={canEditChannelProperties}
                    onEdit={actions.editChannelHeader}
                />
            </ChannelHeader>

            <ChannelLink>{channelURL}</ChannelLink>
        </>
    );
};

export default AboutAreaChannel;
