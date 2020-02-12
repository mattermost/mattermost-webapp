// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, FormattedDate, injectIntl} from 'react-intl';

import UnreadToast from 'components/toast/toast';
import {isIdNotPost, getNewMessageIndex} from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';
import LocalDateTime from 'components/local_date_time';

const TOAST_TEXT_COLLAPSE_WIDTH = 500;

class ToastWrapper extends React.PureComponent {
    static propTypes = {
        unreadCountInChannel: PropTypes.number,
        newRecentMessagesCount: PropTypes.number,
        channelMarkedAsUnread: PropTypes.bool,
        atLatestPost: PropTypes.bool,
        postListIds: PropTypes.array,
        latestPostTimeStamp: PropTypes.number,
        atBottom: PropTypes.bool,
        lastViewedBottom: PropTypes.number,
        width: PropTypes.number,
        lastViewedAt: PropTypes.number,
        updateNewMessagesAtInChannel: PropTypes.func,
        scrollToNewMessage: PropTypes.func,
        scrollToLatestMessages: PropTypes.func,
        updateLastViewedBottomAt: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            unreadCountInChannel: props.unreadCountInChannel,
        };
    }

    static countNewMessages = (postListIds) => {
        const mark = getNewMessageIndex(postListIds);
        if (mark <= 0) {
            return 0;
        }
        const newMessages = postListIds.slice(0, mark);
        return newMessages.filter((id) => !isIdNotPost(id)).length;
    }

    static getDerivedStateFromProps(props, prevState) {
        let {showUnreadToast, showNewMessagesToast} = prevState;
        let unreadCount;

        if (props.atLatestPost) {
            unreadCount = ToastWrapper.countNewMessages(props.postListIds);
        } else if (props.channelMarkedAsUnread) {
            unreadCount = prevState.unreadCountInChannel;
        } else {
            unreadCount = prevState.unreadCountInChannel + props.newRecentMessagesCount;
        }

        // show unread toast on mount when channel is not at bottom and unread count greater than 0
        if (typeof showUnreadToast === 'undefined' && props.atBottom !== null) {
            showUnreadToast = unreadCount > 0 && !props.atBottom;
        }

        // show unread toast when a channel is marked as unread
        if (props.channelMarkedAsUnread && !props.atBottom && !prevState.channelMarkedAsUnread && !prevState.showUnreadToast) {
            showUnreadToast = true;
        }

        // show unread toast when a channel is remarked as unread using the change in lastViewedAt
        // lastViewedAt changes only if a channel is remarked as unread in channelMarkedAsUnread state
        if (props.channelMarkedAsUnread && props.lastViewedAt !== prevState.lastViewedAt && !props.atBottom) {
            showUnreadToast = true;
        }

        if (!showUnreadToast && unreadCount > 0 && !props.atBottom && (props.lastViewedBottom < props.latestPostTimeStamp)) {
            showNewMessagesToast = true;
        }

        if (!unreadCount) {
            showNewMessagesToast = false;
            showUnreadToast = false;
        }

        return {
            unreadCount,
            showUnreadToast,
            showNewMessagesToast,
            lastViewedAt: props.lastViewedAt,
            channelMarkedAsUnread: props.channelMarkedAsUnread,
        };
    }

    componentDidMount() {
        this.mounted = true;
        document.addEventListener('keydown', this.handleShortcut);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.atBottom && this.props.atBottom && this.props.atLatestPost) {
            if (this.state.showNewMessagesToast) {
                this.hideNewMessagesToast(false);
            }

            if (this.state.showUnreadToast) {
                this.hideUnreadToast();
            }
        }

        const prevPostsCount = prevProps.postListIds.length;
        const presentPostsCount = this.props.postListIds.length;
        const postsAddedAtBottom = presentPostsCount !== prevPostsCount && this.props.postListIds[0] !== prevProps.postListIds[0];
        const notBottomWithLatestPosts = !this.props.atBottom && this.props.atLatestPost && presentPostsCount > 0;

        //Marking existing messages as read based on last time user reached to the bottom
        //This moves the new message indicator to the latest posts and keeping in sync with the toast count
        if (postsAddedAtBottom && notBottomWithLatestPosts && !this.state.showUnreadToast) {
            this.props.updateNewMessagesAtInChannel(this.props.lastViewedBottom);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);
    }

    handleShortcut = (e) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
            if (this.state.showUnreadToast) {
                this.hideUnreadToast();
            } else if (this.state.showNewMessagesToast) {
                this.hideNewMessagesToast();
            }
        }
    };

    hideUnreadToast = () => {
        if (this.state.showUnreadToast) {
            this.setState({
                showUnreadToast: false,
            });
        }
    }

    hideNewMessagesToast = (updateLastViewedBottomAt = true) => {
        if (this.state.showNewMessagesToast) {
            this.setState({
                showNewMessagesToast: false,
            });
            if (updateLastViewedBottomAt) {
                this.props.updateLastViewedBottomAt();
            }
        }
    }

    newMessagesToastText = (count, since) => {
        if (this.props.width > TOAST_TEXT_COLLAPSE_WIDTH && typeof since !== 'undefined') {
            return (
                <FormattedMessage
                    id='postlist.toast.newMessagesSince'
                    defaultMessage={'{count, number} new {count, plural, one {message} other {messages}} since {date} at {time}'}
                    values={{
                        count,
                        date: (
                            <FormattedDate
                                value={since}
                                weekday='short'
                                day='2-digit'
                                month='short'
                            />
                        ),
                        time: (
                            <LocalDateTime
                                eventTime={since}
                            />
                        )
                    }}
                />
            );
        }
        return (
            <FormattedMessage
                id='postlist.toast.newMessages'
                defaultMessage={'{count, number} new {count, plural, one {message} other {messages}}'}
                values={{count}}
            />
        );
    }

    scrollToNewMessage = () => {
        this.props.scrollToNewMessage();
        this.props.updateLastViewedBottomAt();
        this.hideNewMessagesToast();
    }

    scrollToLatestMessages = () => {
        this.props.scrollToLatestMessages();
        this.hideUnreadToast();
    }

    render() {
        let toastProps = {
            countUnread: this.state.unreadCount,
            show: false,
            width: this.props.width,
        };

        if (this.state.showUnreadToast) {
            toastProps = {
                ...toastProps,
                onDismiss: this.hideUnreadToast,
                onClick: this.props.scrollToLatestMessages,
                onClickMessage: Utils.localizeMessage('postlist.toast.scrollToBottom', 'Jump to recents'),
                show: true,
                showActions: !this.props.atLatestPost || (this.props.atLatestPost && !this.props.atBottom),
            };
        } else if (this.state.showNewMessagesToast) {
            toastProps = {
                ...toastProps,
                onDismiss: this.hideNewMessagesToast,
                onClick: this.scrollToNewMessage,
                onClickMessage: Utils.localizeMessage('postlist.toast.scrollToLatest', 'Jump to new messages'),
                show: true,
                showActions: !this.props.atLatestPost || (this.props.atLatestPost && !this.props.atBottom),
            };
        }

        return (
            <UnreadToast {...toastProps}>
                {this.newMessagesToastText(this.state.unreadCount, this.props.lastViewedAt)}
            </UnreadToast>
        );
    }
}

export default injectIntl(ToastWrapper);
