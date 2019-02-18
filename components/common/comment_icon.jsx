// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import ReplyIcon from 'components/svg/reply_icon';
import * as Utils from 'utils/utils.jsx';

export default class CommentIcon extends React.PureComponent {
    static propTypes = {
        idPrefix: PropTypes.string.isRequired,
        idCount: PropTypes.number,
        handleCommentClick: PropTypes.func.isRequired,
        searchStyle: PropTypes.string,
        commentCount: PropTypes.number,
        postId: PropTypes.string,
        extraClass: PropTypes.string,
    };

    static defaultProps = {
        idCount: -1,
        searchStyle: '',
        commentCount: 0,
        extraClass: '',
    };

    render() {
        let commentCountSpan = '';
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

        let selectorId = this.props.idPrefix;
        if (this.props.idCount > -1) {
            selectorId += this.props.idCount;
        }

        const id = Utils.createSafeId(this.props.idPrefix + '_' + this.props.postId);

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
                className='hidden-xs'
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <button
                    id={id}
                    className={iconStyle + ' color--link style--none ' + selectorId + ' ' + this.props.extraClass}
                    onClick={this.props.handleCommentClick}
                >
                    <ReplyIcon className='comment-icon'/>
                    {commentCountSpan}
                </button>
            </OverlayTrigger>
        );
    }
}
