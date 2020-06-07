// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';

import FlagIconFilled from 'components/widgets/icons/flag_icon_filled';

export type Props = {
    isFlagged: boolean;
    isPinned: boolean;
    skipPinned?: boolean;
    skipFlagged?: boolean;
}

export enum PostPinnedOrFlagged {
    Flagged,
    Pinned,
    PinnedAndFlagged,
    Neither,
}

class PostPreHeader extends React.PureComponent<Props> {
    getPostStatus(isFlagged: boolean, isPinned: boolean): PostPinnedOrFlagged {
        if (isFlagged && isPinned) {
            return PostPinnedOrFlagged.PinnedAndFlagged;
        } else if (isFlagged) {
            return PostPinnedOrFlagged.Flagged;
        } else if (isPinned) {
            return PostPinnedOrFlagged.Pinned;
        }

        return PostPinnedOrFlagged.Neither;
    }

    getMessageInfo(postStatus: PostPinnedOrFlagged, skipFlagged?: boolean, skipPinned?: boolean): {id: string; defaultMessage: string} | false {
        const messageInfos = {
            pinnedAndFlagged: {id: 'post_pre_header.pinnedAndFlagged', defaultMessage: 'Pinned and Saved'},
            flagged: {id: 'post_pre_header.flagged', defaultMessage: 'Saved'},
            pinned: {id: 'post_pre_header.pinned', defaultMessage: 'Pinned'},
        };

        if (skipFlagged && skipPinned) {
            return false;
        }

        if (postStatus === PostPinnedOrFlagged.PinnedAndFlagged) {
            if (!skipPinned && !skipFlagged) {
                return messageInfos.pinnedAndFlagged;
            } else if (skipPinned) {
                return messageInfos.flagged;
            } else if (skipFlagged) {
                return messageInfos.pinned;
            }
        } else if (postStatus === PostPinnedOrFlagged.Flagged && !skipFlagged) {
            return messageInfos.flagged;
        } else if (postStatus === PostPinnedOrFlagged.Pinned && !skipPinned) {
            return messageInfos.pinned;
        }

        return false;
    }

    render() {
        const {isFlagged, isPinned, skipPinned, skipFlagged} = this.props;

        const messageInfo = this.getMessageInfo(this.getPostStatus(isFlagged, isPinned), skipFlagged, skipPinned);

        if ((!isFlagged && !isPinned) || !messageInfo) {
            return <></>;
        }

        return (
            <div className='post-pre-header'>
                <div className='post-pre-header__icons-container'>
                    {isPinned && !skipPinned && <span className='icon-pin icon icon--post-pre-header'/>}
                    {isFlagged && !skipFlagged && <FlagIconFilled className='icon icon--post-pre-header'/>}
                </div>
                <div className='post-pre-header__text-container'>
                    <FormattedMessage
                        id={messageInfo.id}
                        defaultMessage={messageInfo.defaultMessage}
                    />
                </div>
            </div>
        );
    }
}

export default injectIntl(PostPreHeader);