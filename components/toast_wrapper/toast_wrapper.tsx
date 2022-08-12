// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';

// @ts-expect-error TS(2307): Cannot find module 'components/toast/toast' or its... Remove this comment to see the full error message
import Toast from 'components/toast/toast';

// @ts-expect-error TS(2307): Cannot find module 'components/timestamp' or its c... Remove this comment to see the full error message
import Timestamp, {RelativeRanges} from 'components/timestamp';

// @ts-expect-error TS(2307): Cannot find module 'utils/post_utils' or its corre... Remove this comment to see the full error message
import {isIdNotPost, getNewMessageIndex} from 'utils/post_utils';

// @ts-expect-error TS(2307): Cannot find module 'utils/utils' or its correspond... Remove this comment to see the full error message
import * as Utils from 'utils/utils';

// @ts-expect-error TS(2307): Cannot find module 'utils/datetime' or its corresp... Remove this comment to see the full error message
import {isToday} from 'utils/datetime';

// @ts-expect-error TS(2307): Cannot find module 'utils/constants' or its corres... Remove this comment to see the full error message
import Constants from 'utils/constants';

// @ts-expect-error TS(2307): Cannot find module 'utils/browser_history' or its ... Remove this comment to see the full error message
import {browserHistory} from 'utils/browser_history';

// @ts-expect-error TS(2307): Cannot find module 'components/search_shortcut' or... Remove this comment to see the full error message
import {SearchShortcut} from 'components/search_shortcut';

// @ts-expect-error TS(2307): Cannot find module 'components/hint-toast/hint_toa... Remove this comment to see the full error message
import {HintToast} from 'components/hint-toast/hint_toast';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/constants' or... Remove this comment to see the full error message
import {Preferences} from 'mattermost-redux/constants';
import {IDMappedObjects} from '@mattermost/types/utilities';
import {Post} from '@mattermost/types/posts';

const TOAST_TEXT_COLLAPSE_WIDTH = 500;

const TOAST_REL_RANGES = [
    RelativeRanges.TODAY_YESTERDAY,
];

type OwnProps = {
    unreadCountInChannel: number;
    newRecentMessagesCount: number;
    channelMarkedAsUnread?: boolean;
    isCollapsedThreadsEnabled?: boolean;
    rootPosts: IDMappedObjects<Post>;
    atLatestPost?: boolean;
    postListIds: string[];
    latestPostTimeStamp: number;
    atBottom?: boolean;
    lastViewedBottom: number;
    width?: number;
    lastViewedAt?: number;
    focusedPostId?: string;
    initScrollOffsetFromBottom: number;

    updateNewMessagesAtInChannel: (lastViewedAt?: number) => void;

    scrollToNewMessage: () => void;

    scrollToLatestMessages: () => void;

    scrollToUnreadMessages: () => void;

    updateLastViewedBottomAt: (lastViewedBottom?: number) => void;
    showSearchHintToast?: boolean;

    // @ts-expect-error TS(2552): Cannot find name '$TSFixMeFunction'. Did you mean ... Remove this comment to see the full error message
    onSearchHintDismiss?: $TSFixMeFunction;
    shouldStartFromBottomWhenUnread?: boolean;
    isNewMessageLineReached?: boolean;
    unreadScrollPosition?: string;
    match: {
        params: {
            team?: string;
        };
    };
    actions: {

        // @ts-expect-error TS(2552): Cannot find name '$TSFixMeFunction'. Did you mean ... Remove this comment to see the full error message
        updateToastStatus: $TSFixMeFunction;
    };
};

type State = $TSFixMe;

type Props = OwnProps & typeof ToastWrapper.defaultProps;

class ToastWrapper extends React.PureComponent<Props, State> {
    static defaultProps = {
        focusedPostId: '',
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            unreadCountInChannel: props.unreadCountInChannel,
        };
    }

    static countNewMessages = (postListIds: string[], rootPosts: IDMappedObjects<Post>, isCollapsedThreadsEnabled: $TSFixMe) => {
        const mark = getNewMessageIndex(postListIds);
        if (mark <= 0) {
            return 0;
        }
        let newMessages = postListIds.slice(0, mark).filter((id: $TSFixMe) => !isIdNotPost(id));
        if (isCollapsedThreadsEnabled) { // in collapsed mode we only count root posts
            newMessages = newMessages.filter((id: $TSFixMe) => rootPosts[id]);
        }
        return newMessages.length;
    }

    mounted: $TSFixMe;

    static getDerivedStateFromProps(props: Props, prevState: $TSFixMe) {
        let {showUnreadToast, showNewMessagesToast, showMessageHistoryToast, showUnreadWithBottomStartToast} = prevState;
        let unreadCount;

        if (props.atLatestPost) {
            if (props.unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST && prevState.unreadCountInChannel) {
                unreadCount = prevState.unreadCountInChannel + props.newRecentMessagesCount;
            } else {
                unreadCount = ToastWrapper.countNewMessages(props.postListIds, props.rootPosts, props.isCollapsedThreadsEnabled);
            }
        } else if (props.channelMarkedAsUnread) {
            if (props.unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST) {
                unreadCount = props.unreadCountInChannel + props.newRecentMessagesCount;
            } else {
                unreadCount = prevState.unreadCountInChannel;
            }
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

        if (props.unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST && !props.channelMarkedAsUnread) {
            showUnreadToast = false;
        }

        if (!unreadCount) {
            showUnreadToast = false;
            showNewMessagesToast = false;
        }

        if (props.isNewMessageLineReached) {
            showUnreadWithBottomStartToast = false;
        }

        if (
            typeof showUnreadWithBottomStartToast === 'undefined' &&
            props.lastViewedAt &&
            props.lastViewedAt !== prevState.lastViewedAt &&
            props.shouldStartFromBottomWhenUnread &&
            unreadCount > 0 &&
            !props.isNewMessageLineReached
        ) {
            showUnreadWithBottomStartToast = true;
        }

        return {
            unreadCount,
            showUnreadToast,
            showNewMessagesToast,
            showUnreadWithBottomStartToast,
            lastViewedAt: props.lastViewedAt,
            atBottom: props.atBottom,
            channelMarkedAsUnread: props.channelMarkedAsUnread,
            showMessageHistoryToast,
        };
    }

    componentDidMount() {
        this.mounted = true;
        const {showUnreadToast, showNewMessagesToast, showMessageHistoryToast, showUnreadWithBottomStartToast} = this.state;
        const toastPresent = Boolean(showUnreadToast || showNewMessagesToast || showMessageHistoryToast || showUnreadWithBottomStartToast);
        document.addEventListener('keydown', this.handleShortcut);
        this.props.actions.updateToastStatus(toastPresent);
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {showUnreadToast, showNewMessagesToast, showMessageHistoryToast, showUnreadWithBottomStartToast} = this.state;
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

        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        const prevPostsCount = prevProps.postListIds.length;

        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        const presentPostsCount = postListIds.length;

        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        const postsAddedAtBottom = presentPostsCount !== prevPostsCount && postListIds[0] !== prevProps.postListIds[0];
        const notBottomWithLatestPosts = atBottom === false && atLatestPost && presentPostsCount > 0;

        //Marking existing messages as read based on last time user reached to the bottom
        //This moves the new message indicator to the latest posts and keeping in sync with the toast count
        if (postsAddedAtBottom && notBottomWithLatestPosts && !showUnreadToast) {
            updateNewMessagesAtInChannel(lastViewedBottom);
        }

        const toastStateChanged = prevState.showUnreadToast !== showUnreadToast ||
                                  prevState.showNewMessagesToast !== showNewMessagesToast ||
                                  prevState.showMessageHistoryToast !== showMessageHistoryToast ||
                                  prevState.showUnreadWithBottomStartToast !== showUnreadWithBottomStartToast;

        if (toastStateChanged) {
            const toastPresent = Boolean(showUnreadToast || showNewMessagesToast || showMessageHistoryToast || showUnreadWithBottomStartToast);
            actions.updateToastStatus(toastPresent);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);
    }

    handleShortcut = (e: $TSFixMe) => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
            if (this.state.showUnreadToast) {
                this.hideUnreadToast();
            } else if (this.state.showNewMessagesToast) {
                this.hideNewMessagesToast();
            } else if (this.state.showUnreadWithBottomStartToast) {
                this.hideUnreadWithBottomStartToast();
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

    hideUnreadWithBottomStartToast = () => {
        if (this.state.showUnreadWithBottomStartToast) {
            this.setState({
                showUnreadWithBottomStartToast: false,
            });
        }
    }

    newMessagesToastText = (count: $TSFixMe, since: $TSFixMe) => {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        if (this.props.width > TOAST_TEXT_COLLAPSE_WIDTH && typeof since !== 'undefined') {
            return (

                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <FormattedMessage
                    id='postlist.toast.newMessagesSince'
                    defaultMessage='{count, number} new {count, plural, one {message} other {messages}} {isToday, select, true {} other {since}} {date}'
                    values={{
                        count,
                        isToday: isToday(new Date(since)).toString(),
                        date: (

                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <FormattedMessage
                id='postlist.toast.newMessages'
                defaultMessage={'{count, number} new {count, plural, one {message} other {messages}}'}
                values={{count}}
            />
        );
    }

    archiveToastText = () => {
        return (

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <FormattedMessage
                id='postlist.toast.history'
                defaultMessage='Viewing message history'
            />
        );
    }

    getSearchHintToastText = () => {
        return (

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <FormattedMessage
                id='postlist.toast.searchHint'
                defaultMessage='Tip: Try {searchShortcut} to search this channel'
                values={{

                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

    scrollToUnreadMessages = () => {
        this.props.scrollToUnreadMessages();
        this.hideUnreadWithBottomStartToast();
    }

    getToastToRender() {
        const {atLatestPost, atBottom, width, lastViewedAt, showSearchHintToast} = this.props;
        const {showUnreadToast, showNewMessagesToast, showMessageHistoryToast, showUnreadWithBottomStartToast, unreadCount} = this.state;

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

                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <Toast {...unreadToastProps}>
                    {this.newMessagesToastText(unreadCount, lastViewedAt)}
                </Toast>
            );
        }

        const unreadWithBottomStartToastProps = {
            show: true,
            width,
            onDismiss: this.hideUnreadWithBottomStartToast,
            onClick: this.scrollToUnreadMessages,
            onClickMessage: Utils.localizeMessage('postlist.toast.scrollToUnread', 'Jump to unreads'),
            showActions: true,
            jumpDirection: 'up',
        };

        if (showUnreadWithBottomStartToast && unreadCount > 0) {
            return (

                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <Toast {...unreadWithBottomStartToastProps}>
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

                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <Toast {...archiveToastProps}>
                    {this.archiveToastText()}
                </Toast>
            );
        }

        if (showSearchHintToast) {
            return (

                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <React.Fragment>
                {toastToRender}
            </React.Fragment>
        );
    }
}

export default injectIntl(ToastWrapper);
