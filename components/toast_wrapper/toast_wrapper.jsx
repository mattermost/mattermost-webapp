// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl';

import Toast from 'components/toast/toast';
import Timestamp, {RelativeRanges} from 'components/timestamp';
import {isIdNotPost, getNewMessageIndex} from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import {isToday} from 'utils/datetime';
import Constants from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import {SearchShortcut} from 'components/search_shortcut/search_shortcut';
import {HintToast} from 'components/hint-toast/hint_toast';

const TOAST_TEXT_COLLAPSE_WIDTH = 500;

const TOAST_REL_RANGES = [
    RelativeRanges.TODAY_YESTERDAY,
];

class ToastWrapper extends React.PureComponent {
    static propTypes = {
        unreadCountInChannel: PropTypes.number,
        newRecentMessagesCount: PropTypes.number,
        channelMarkedAsUnread: PropTypes.bool,
        isCollapsedThreadsEnabled: PropTypes.bool,
        rootPosts: PropTypes.object,
        atLatestPost: PropTypes.bool,
        postListIds: PropTypes.array,
        latestPostTimeStamp: PropTypes.number,
        atBottom: PropTypes.bool,
        lastViewedBottom: PropTypes.number,
        width: PropTypes.number,
        lastViewedAt: PropTypes.number,
        focusedPostId: PropTypes.string,
        initScrollOffsetFromBottom: PropTypes.number,
        updateNewMessagesAtInChannel: PropTypes.func,
        scrollToNewMessage: PropTypes.func,
        scrollToLatestMessages: PropTypes.func,
        updateLastViewedBottomAt: PropTypes.func,
        showSearchHintToast: PropTypes.bool,
        onSearchHintDismiss: PropTypes.func,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                team: PropTypes.string,
            }).isRequired,
        }).isRequired,

        actions: PropTypes.shape({

            /**
             * Action creator to update toast status
             */
            updateToastStatus: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        focusedPostId: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            unreadCountInChannel: props.unreadCountInChannel,
        };
    }

    static countNewMessages = (postListIds, rootPosts, isCollapsedThreadsEnabled) => {
        const mark = getNewMessageIndex(postListIds);
        if (mark <= 0) {
            return 0;
        }
        let newMessages = postListIds.slice(0, mark).filter((id) => !isIdNotPost(id));
        if (isCollapsedThreadsEnabled) { // in collapsed mode we only count root posts
            newMessages = newMessages.filter((id) => rootPosts[id]);
        }
        return newMessages.length;
    }

    static getDerivedStateFromProps(props, prevState) {
        let {showUnreadToast, showNewMessagesToast, showMessageHistoryToast} = prevState;
        let unreadCount;
        if (props.atLatestPost) {
            unreadCount = ToastWrapper.countNewMessages(props.postListIds, props.rootPosts, props.isCollapsedThreadsEnabled);
        } else if (props.channelMarkedAsUnread) {
            unreadCount = prevState.unreadCountInChannel;
        } else {
            unreadCount = prevState.unreadCountInChannel + props.newRecentMessagesCount;
        }

        // show unread toast on mount when channel is not at bottom and unread count greater than 0
        if (typeof showUnreadToast === 'undefined' && props.atBottom !== null) {
            showUnreadToast = unreadCount > 0 && !props.atBottom;
        }

        if (typeof showMessageHistoryToast === 'undefined' && props.focusedPostId !== '' && props.atBottom !== null) {
            showMessageHistoryToast = props.initScrollOffsetFromBottom > 1000 || !props.atLatestPost;
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
            showMessageHistoryToast,
        };
    }

    componentDidMount() {
        this.mounted = true;
        const {showUnreadToast, showNewMessagesToast, showMessageHistoryToast} = this.state;
        const toastPresent = Boolean(showUnreadToast || showNewMessagesToast || showMessageHistoryToast);
        document.addEventListener('keydown', this.handleShortcut);
        this.props.actions.updateToastStatus(toastPresent);
    }

    componentDidUpdate(prevProps, prevState) {
        const {showUnreadToast, showNewMessagesToast, showMessageHistoryToast} = this.state;
        const {
            atBottom,
            atLatestPost,
            postListIds,
            lastViewedBottom,
            updateNewMessagesAtInChannel,
            actions,
        } = this.props;

        if (!prevProps.atBottom && atBottom && atLatestPost) {
            this.hideNewMessagesToast(false);
            this.hideUnreadToast();
            this.hideArchiveToast();
        }

        const prevPostsCount = prevProps.postListIds.length;
        const presentPostsCount = postListIds.length;
        const postsAddedAtBottom = presentPostsCount !== prevPostsCount && postListIds[0] !== prevProps.postListIds[0];
        const notBottomWithLatestPosts = atBottom === false && atLatestPost && presentPostsCount > 0;

        //Marking existing messages as read based on last time user reached to the bottom
        //This moves the new message indicator to the latest posts and keeping in sync with the toast count
        if (postsAddedAtBottom && notBottomWithLatestPosts && !showUnreadToast) {
            updateNewMessagesAtInChannel(lastViewedBottom);
        }

        const toastStateChanged = prevState.showUnreadToast !== showUnreadToast ||
                                  prevState.showNewMessagesToast !== showNewMessagesToast ||
                                  prevState.showMessageHistoryToast !== showMessageHistoryToast;

        if (toastStateChanged) {
            const toastPresent = Boolean(showUnreadToast || showNewMessagesToast || showMessageHistoryToast);
            actions.updateToastStatus(toastPresent);
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
            } else {
                this.hideArchiveToast();
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

    hideArchiveToast = () => {
        if (this.state.showMessageHistoryToast) {
            this.setState({
                showMessageHistoryToast: false,
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

    hideSearchHintToast = () => {
        if (this.props.onSearchHintDismiss) {
            this.props.onSearchHintDismiss();
        }
    }

    newMessagesToastText = (count, since) => {
        if (this.props.width > TOAST_TEXT_COLLAPSE_WIDTH && typeof since !== 'undefined') {
            return (
                <FormattedMessage
                    id='postlist.toast.newMessagesSince'
                    defaultMessage='{count, number} new {count, plural, one {message} other {messages}} {isToday, select, true {} other {since}} {date}'
                    values={{
                        count,
                        isToday: isToday(new Date(since)).toString(),
                        date: (
                            <Timestamp
                                value={since}
                                useTime={false}
                                ranges={TOAST_REL_RANGES}
                            />
                        ),
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

    archiveToastText = () => {
        return (
            <FormattedMessage
                id='postlist.toast.history'
                defaultMessage='Viewing message history'
            />
        );
    }

    getSearchHintToastText = () => {
        return (
            <FormattedMessage
                id='postlist.toast.searchHint'
                defaultMessage='Tip: Try {searchShortcut} to search this channel'
                values={{
                    searchShortcut: <SearchShortcut/>,
                }}
            />
        );
    }

    changeUrlToRemountChannelView = () => {
        const {match} = this.props;

        // Inorder of mount the channel view we are redirecting to /team url to load the channel again
        // Todo: Can be changed to dispatch if we put focussedPostId in redux state.
        browserHistory.replace(`/${match.params.team}`);
    }

    scrollToNewMessage = () => {
        const {focusedPostId, atLatestPost, scrollToNewMessage, updateLastViewedBottomAt} = this.props;

        // if latest set of posts are not loaded in the view then we cannot scroll to the message
        // We will be chaging the url to remount the channel view so we can remove the focussedPostId react state
        // if we don't remove the focussedPostId state then scroll tries to correct to that instead of new message line
        if (focusedPostId && !atLatestPost) {
            this.changeUrlToRemountChannelView();
            return;
        }

        scrollToNewMessage();
        updateLastViewedBottomAt();
        this.hideNewMessagesToast();
    }

    scrollToLatestMessages = () => {
        const {focusedPostId, atLatestPost, scrollToLatestMessages} = this.props;

        if (focusedPostId) {
            if (!atLatestPost) {
                this.changeUrlToRemountChannelView();
                return;
            }
            this.hideArchiveToast();
        }

        scrollToLatestMessages();
        this.hideUnreadToast();
    }

    getToastToRender() {
        const {atLatestPost, atBottom, width, lastViewedAt, showSearchHintToast} = this.props;
        const {showUnreadToast, showNewMessagesToast, showMessageHistoryToast, unreadCount} = this.state;

        const unreadToastProps = {
            show: true,
            width,
            onDismiss: this.hideUnreadToast,
            onClick: this.scrollToLatestMessages,
            onClickMessage: Utils.localizeMessage('postlist.toast.scrollToBottom', 'Jump to recents'),
            showActions: !atLatestPost || (atLatestPost && !atBottom),
        };

        if (showUnreadToast && unreadCount > 0) {
            return (
                <Toast {...unreadToastProps}>
                    {this.newMessagesToastText(unreadCount, lastViewedAt)}
                </Toast>
            );
        }

        if (showNewMessagesToast) {
            const showNewMessagesToastOverrides = {
                onDismiss: this.hideNewMessagesToast,
                onClick: this.scrollToNewMessage,
                onClickMessage: Utils.localizeMessage('postlist.toast.scrollToLatest', 'Jump to new messages'),
            };

            return (
                <Toast
                    {...unreadToastProps}
                    {...showNewMessagesToastOverrides}
                >
                    {this.newMessagesToastText(unreadCount, lastViewedAt)}
                </Toast>
            );
        }

        if (showMessageHistoryToast) {
            const archiveToastProps = {
                show: true,
                width,
                onDismiss: this.hideArchiveToast,
                onClick: this.scrollToLatestMessages,
                onClickMessage: Utils.localizeMessage('postlist.toast.scrollToBottom', 'Jump to recents'),
                showActions: true,
                extraClasses: 'toast__history',
            };

            return (
                <Toast {...archiveToastProps}>
                    {this.archiveToastText()}
                </Toast>
            );
        }

        if (showSearchHintToast) {
            return (
                <HintToast
                    onDismiss={this.hideSearchHintToast}
                >
                    {this.getSearchHintToastText()}
                </HintToast>
            );
        }

        return null;
    }

    render() {
        const toastToRender = this.getToastToRender();

        return (
            <React.Fragment>
                {toastToRender}
            </React.Fragment>
        );
    }
}

export default injectIntl(ToastWrapper);
