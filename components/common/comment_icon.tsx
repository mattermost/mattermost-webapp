// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {localizeMessage} from 'utils/utils.jsx';

import OverlayTrigger from 'components/overlay_trigger';
import ReplyIcon from 'components/widgets/icons/reply_icon';

type Props = {
    location: 'CENTER' | 'SEARCH';
    handleCommentClick: React.EventHandler<React.MouseEvent>;
    searchStyle: string;
    commentCount: number;
    postId?: string;
    extraClass: string;
}

export default class CommentIcon extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        location: 'CENTER',
        searchStyle: '',
        commentCount: 0,
        extraClass: '',
    }

    public render(): JSX.Element {
        let commentCountSpan: JSX.Element | null = null;
        let iconStyle = 'comment-icon__container';
        if (this.props.commentCount > 0) {
            iconStyle += ' icon--show';
            commentCountSpan = (
                <span className='comment-count'>
                    {this.props.commentCount}
                </span>
            );
        } else if (this.props.searchStyle !== '') {
            iconStyle = iconStyle + ' ' + this.props.searchStyle;
        }

        const tooltip = (
            <Tooltip
                id='comment-icon-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id='post_info.comment_icon.tooltip.reply'
                    defaultMessage='Reply'
                />
            </Tooltip>
        );

        return (
            <OverlayTrigger
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <button
                    id={`${this.props.location}_commentIcon_${this.props.postId}`}
                    aria-label={localizeMessage('post_info.comment_icon.tooltip.reply', 'Reply').toLowerCase()}
                    className={iconStyle + ' color--link style--none ' + this.props.extraClass}
                    onClick={this.props.handleCommentClick}
                >
                    <span className='d-flex'>
                        <ReplyIcon className='comment-icon'/>
                        {commentCountSpan}
                    </span>
                </button>
            </OverlayTrigger>
        );
    }
}

