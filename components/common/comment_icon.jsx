// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ReplyIcon from 'components/svg/reply_icon';

import * as Utils from 'utils/utils.jsx';

export default class CommentIcon extends React.PureComponent {
    static propTypes = {
        idPrefix: PropTypes.string.isRequired,
        idCount: PropTypes.number,
        handleCommentClick: PropTypes.func.isRequired,
        searchStyle: PropTypes.string,
        commentCount: PropTypes.number,
        id: PropTypes.string
    };

    static defaultProps = {
        idCount: -1,
        searchStyle: '',
        commentCount: 0,
        id: ''
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

        const id = Utils.createSafeId(this.props.idPrefix + '_' + this.props.id);

        return (
            <button
                id={id}
                className={iconStyle + ' color--link style--none ' + selectorId}
                onClick={this.props.handleCommentClick}
            >
                <ReplyIcon className='comment-icon'/>
                {commentCountSpan}
            </button>
        );
    }
}
