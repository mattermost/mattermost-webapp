// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import Markdown from 'components/markdown';

import LineLimiter from './components/linelimiter';
import EditableArea from './components/editable_area';

const ChannelLink = styled.div`
    margin-bottom: 12px;
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 0.02em;
    color: rgba(var(--center-channel-color-rgb), .64);
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

            {(channel.purpose || canEditChannelProperties) && (
                <ChannelPurpose>
                    <EditableArea
                        editable={canEditChannelProperties}
                        content={channel.purpose && (
                            <LineLimiter
                                maxLines={3}
                                lineHeight={20}
                                moreText={formatMessage({id: 'channel_info_rhs.about_area.channel_purpose.line_limiter.more', defaultMessage: '... more'})}
                                lessText={formatMessage({id: 'channel_info_rhs.about_area.channel_purpose.line_limiter.less', defaultMessage: 'less'})}
                            >
                                <Markdown message={channel.purpose}/>
                            </LineLimiter>
                        )}
                        onEdit={actions.editChannelPurpose}
                        emptyLabel={formatMessage({id: 'channel_info_rhs.about_area.add_channel_purpose', defaultMessage: 'Add a channel purpose'})}
                    />
                </ChannelPurpose>
            )}

            {(channel.header || canEditChannelProperties) && (
                <ChannelHeader>
                    <EditableArea
                        content={channel.header && (
                            <LineLimiter
                                maxLines={3}
                                lineHeight={20}
                                moreText={formatMessage({id: 'channel_info_rhs.about_area.channel_header.line_limiter.more', defaultMessage: '... more'})}
                                lessText={formatMessage({id: 'channel_info_rhs.about_area.channel_header.line_limiter.less', defaultMessage: 'less'})}
                            >
                                <Markdown message={channel.header}/>
                            </LineLimiter>
                        )}
                        editable={canEditChannelProperties}
                        onEdit={actions.editChannelHeader}
                        emptyLabel={formatMessage({id: 'channel_info_rhs.about_area.add_channel_header', defaultMessage: 'Add a channel header'})}
                    />
                </ChannelHeader>
            )}

            <ChannelLink>{channelURL}</ChannelLink>
        </>
    );
};

export default AboutAreaChannel;
