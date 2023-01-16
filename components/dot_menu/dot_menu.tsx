// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime, injectIntl, IntlShape} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';

import {Locations, ModalIdentifiers, Constants, TELEMETRY_LABELS, Preferences} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import PostReminderCustomTimePicker from 'components/post_reminder_time_picker_modal';
import Tooltip from 'components/tooltip';
import DelayedAction from 'utils/delayed_action';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import * as Menu from 'components/menu';
import {ModalData} from 'types/actions';
import {
    ArrowForwardIosIcon,
    ArrowRightBoldOutlineIcon,
    BookmarkIcon,
    BookmarkOutlineIcon,
    ClockOutlineIcon,
    ContentCopyIcon,
    DotsHorizontalIcon,
    EmoticonPlusOutlineIcon,
    LinkVariantIcon,
    MarkAsUnreadIcon,
    MessageCheckOutlineIcon,
    MessageMinusOutlineIcon,
    PencilOutlineIcon,
    PinIcon,
    PinOutlineIcon,
    ReplyOutlineIcon,
    TrashCanOutlineIcon,
} from '@mattermost/compass-icons/components';
import {PluginComponent} from 'types/store/plugins';

import {toUTCUnix} from 'utils/datetime';

import {getCurrentMomentForTimezone} from 'utils/timezone';

import ForwardPostModal from '../forward_post_modal';
import Badge from '../widgets/badges/badge';

import {UserThread} from '@mattermost/types/threads';
import {Post} from '@mattermost/types/posts';

import {ChangeEvent, trackDotMenuEvent} from './utils';

import './dot_menu.scss';

type ShortcutKeyProps = {
    shortcutKey: string;
};

const ShortcutKey = ({shortcutKey: shortcut}: ShortcutKeyProps) => (
    <span className={'MenuItem__opacity MenuItem__right-decorator'}>
        {shortcut}
    </span>
);

const MENU_BOTTOM_MARGIN = 80;

type Props = {
    intl: IntlShape;
    post: Post;
    teamId: string;
    location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | 'SEARCH' | string;
    isFlagged?: boolean;
    handleCommentClick?: React.EventHandler<any>;
    handleDropdownOpened: (open: boolean) => void;
    handleAddReactionClick?: () => void;
    isMenuOpen?: boolean;
    isReadOnly?: boolean;
    isLicensed?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    postEditTimeLimit?: string; // TechDebt: Made non-mandatory while converting to typescript
    enableEmojiPicker?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    channelIsArchived?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    currentTeamUrl?: string; // TechDebt: Made non-mandatory while converting to typescript
    teamUrl?: string; // TechDebt: Made non-mandatory while converting to typescript
    isMobileView: boolean;
    timezone?: string;
    isMilitaryTime: boolean;
    showForwardPostNewLabel: boolean;

    /**
     * Components for overriding provided by plugins
     */
    components: {
        [componentName: string]: PluginComponent[];
    };

    actions: {

        /**
         * Function flag the post
         */
        flagPost: (postId: string) => void;

        /**
         * Function to unflag the post
         */
        unflagPost: (postId: string) => void;

        /**
         * Function to set the editing post
         */
        setEditingPost: (postId?: string, refocusId?: string, title?: string, isRHS?: boolean) => void;

        /**
         * Function to pin the post
         */
        pinPost: (postId: string) => void;

        /**
         * Function to unpin the post
         */
        unpinPost: (postId: string) => void;

        /**
         * Function to open a modal
         */
        openModal: <P>(modalData: ModalData<P>) => void;

        /**
         * Function to set the unread mark at given post
         */
        markPostAsUnread: (post: Post, location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | string) => void;

        /**
         * Function to set the thread as followed/unfollowed
         */
        setThreadFollow: (userId: string, teamId: string, threadId: string, newState: boolean) => void;

        /**
         * Function to add a post reminder
         */
        addPostReminder: (postId: string, userId: string, timestamp: number) => void;

        /**
         * Function to set a global storage item on the store
         */
        setGlobalItem: (name: string, value: any) => void;
    }; // TechDebt: Made non-mandatory while converting to typescript

    canEdit: boolean;
    canDelete: boolean;
    userId: string;
    threadId: UserThread['id'];
    isCollapsedThreadsEnabled: boolean;
    isFollowingThread?: boolean;
    isMentionedInRootPost?: boolean;
    threadReplyCount?: number;
}

type State = {
    openUp: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export class DotMenuClass extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        isFlagged: false,
        isReadOnly: false,
        location: Locations.CENTER,
    }
    private editDisableAction: DelayedAction;
    private buttonRef: React.RefObject<HTMLButtonElement>;
    private canPostBeForwarded: boolean;

    constructor(props: Props) {
        super(props);

        this.editDisableAction = new DelayedAction(this.handleEditDisable);

        this.state = {
            openUp: false,
            canEdit: props.canEdit && !props.isReadOnly,
            canDelete: props.canDelete && !props.isReadOnly,
        };

        this.buttonRef = React.createRef<HTMLButtonElement>();

        this.canPostBeForwarded = false;
    }

    static getDerivedStateFromProps(props: Props) {
        const state: Partial<State> = {
            canEdit: props.canEdit && !props.isReadOnly,
            canDelete: props.canDelete && !props.isReadOnly,
        };
        return state;
    }

    disableCanEditPostByTime(): void {
        const {post, isLicensed} = this.props;
        const {canEdit} = this.state;

        const postEditTimeLimit = this.props.postEditTimeLimit || Constants.UNSET_POST_EDIT_TIME_LIMIT;

        if (canEdit && isLicensed) {
            if (postEditTimeLimit !== String(Constants.UNSET_POST_EDIT_TIME_LIMIT)) {
                const milliseconds = 1000;
                const timeLeft = (post.create_at + (Number(postEditTimeLimit) * milliseconds)) - Utils.getTimestamp();
                if (timeLeft > 0) {
                    this.editDisableAction.fireAfter(timeLeft + milliseconds);
                }
            }
        }
    }

    componentDidMount(): void {
        this.disableCanEditPostByTime();
    }

    componentWillUnmount(): void {
        this.editDisableAction.cancel();
    }

    handleEditDisable = (): void => {
        this.setState({canEdit: false});
    }

    handleFlagMenuItemActivated = (e: ChangeEvent): void => {
        if (this.props.isFlagged) {
            trackDotMenuEvent(e, TELEMETRY_LABELS.UNSAVE);
            this.props.actions.unflagPost(this.props.post.id);
        } else {
            trackDotMenuEvent(e, TELEMETRY_LABELS.SAVE);
            this.props.actions.flagPost(this.props.post.id);
        }
    }

    // listen to clicks/taps on add reaction menu item and pass to parent handler
    handleAddReactionMenuItemActivated = (e: React.MouseEvent): void => {
        e.preventDefault();

        // to be safe, make sure the handler function has been defined
        if (this.props.handleAddReactionClick) {
            this.props.handleAddReactionClick();
        }
    }

    copyLink = (e: ChangeEvent) => {
        trackDotMenuEvent(e, TELEMETRY_LABELS.COPY_LINK);
        Utils.copyToClipboard(`${this.props.teamUrl}/pl/${this.props.post.id}`);
    }

    copyText = (e: ChangeEvent) => {
        trackDotMenuEvent(e, TELEMETRY_LABELS.COPY_TEXT);
        Utils.copyToClipboard(this.props.post.message);
    }

    handlePinMenuItemActivated = (e: ChangeEvent): void => {
        if (this.props.post.is_pinned) {
            trackDotMenuEvent(e, TELEMETRY_LABELS.UNPIN);
            this.props.actions.unpinPost(this.props.post.id);
        } else {
            trackDotMenuEvent(e, TELEMETRY_LABELS.PIN);
            this.props.actions.pinPost(this.props.post.id);
        }
    }

    handleMarkPostAsUnread = (e: ChangeEvent): void => {
        e.preventDefault();
        trackDotMenuEvent(e, TELEMETRY_LABELS.UNREAD);
        this.props.actions.markPostAsUnread(this.props.post, this.props.location);
    }

    handleDeleteMenuItemActivated = (e: ChangeEvent): void => {
        e.preventDefault();

        trackDotMenuEvent(e, TELEMETRY_LABELS.DELETE);
        const deletePostModalData = {
            modalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: this.props.post,
                isRHS: this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
            },
        };

        this.props.actions.openModal(deletePostModalData);
    }

    handleForwardMenuItemActivated = (e: ChangeEvent): void => {
        if (!this.canPostBeForwarded) {
            // adding this early return since only hiding the Item from the menu is not enough,
            // since a user can always use the Shortcuts to activate the function as well
            return;
        }

        e.preventDefault();

        trackDotMenuEvent(e, TELEMETRY_LABELS.FORWARD);
        const forwardPostModalData = {
            modalId: ModalIdentifiers.FORWARD_POST_MODAL,
            dialogType: ForwardPostModal,
            dialogProps: {
                post: this.props.post,
            },
        };

        if (this.props.showForwardPostNewLabel) {
            this.props.actions.setGlobalItem(Preferences.FORWARD_POST_VIEWED, false);
        }
        this.props.actions.openModal(forwardPostModalData);
    }

    handleEditMenuItemActivated = (e: ChangeEvent): void => {
        trackDotMenuEvent(e, TELEMETRY_LABELS.EDIT);
        this.props.handleDropdownOpened?.(false);
        this.props.actions.setEditingPost(
            this.props.post.id,
            this.props.location === Locations.CENTER ? 'post_textbox' : 'reply_textbox',
            this.props.post.root_id ? Utils.localizeMessage('rhs_comment.comment', 'Comment') : Utils.localizeMessage('create_post.post', 'Post'),
            this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT || this.props.location === Locations.SEARCH,
        );
    }

    handleSetThreadFollow = (e: ChangeEvent) => {
        const {actions, teamId, threadId, userId, isFollowingThread, isMentionedInRootPost} = this.props;
        let followingThread: boolean;

        // This is required as post with mention doesn't have isFollowingThread property set to true but user with mention is following, so we will get null as value kind of hack for this.

        if (isFollowingThread === null) {
            followingThread = !isMentionedInRootPost;
        } else {
            followingThread = !isFollowingThread;
        }

        if (followingThread) {
            trackDotMenuEvent(e, TELEMETRY_LABELS.FOLLOW);
        } else {
            trackDotMenuEvent(e, TELEMETRY_LABELS.UNFOLLOW);
        }
        actions.setThreadFollow(
            userId,
            teamId,
            threadId,
            followingThread,
        );
    }

    handleCommentClick = (e: ChangeEvent) => {
        trackDotMenuEvent(e, TELEMETRY_LABELS.REPLY);
        this.props.handleCommentClick?.(e);
    }

    setPostReminder = (id: string): void => {
        const currentDate = getCurrentMomentForTimezone(this.props.timezone);
        let endTime = currentDate;
        switch (id) {
        case 'thirty_minutes':
            // add 30 minutes in current time
            endTime = currentDate.add(30, 'minutes');
            break;
        case 'one_hour':
            // add 1 hour in current time
            endTime = currentDate.add(1, 'hour');
            break;
        case 'two_hours':
            // add 2 hours in current time
            endTime = currentDate.add(2, 'hours');
            break;
        case 'tomorrow':
            // add one day in current date
            endTime = currentDate.add(1, 'day');
            break;
        }

        this.props.actions.addPostReminder(this.props.userId, this.props.post.id, toUTCUnix(endTime.toDate()));
    }

    setCustomPostReminder = (): void => {
        const postReminderCustomTimePicker = {
            modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
            dialogType: PostReminderCustomTimePicker,
            dialogProps: {
                postId: this.props.post.id,
                currentDate: new Date(),
            },
        };

        this.props.actions.openModal(postReminderCustomTimePicker);
    }

    tooltip = (
        <Tooltip
            id='dotmenu-icon-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='post_info.dot_menu.tooltip.more_actions'
                defaultMessage='More'
            />
        </Tooltip>
    )

    renderDivider = (suffix: string): React.ReactNode => {
        return (
            <li
                id={`divider_post_${this.props.post.id}_${suffix}`}
                className='MenuItem__divider'
                role='menuitem'
            />
        );
    }

    isKeyboardEvent = (e: React.KeyboardEvent): any => {
        return (e).getModifierState !== undefined;
    }

    onShortcutKeyDown = (e: React.KeyboardEvent): void => {
        e.preventDefault();
        if (!this.isKeyboardEvent(e)) {
            return;
        }

        const isShiftKeyPressed = e.shiftKey;

        switch (true) {
        case Utils.isKeyPressed(e, Constants.KeyCodes.R):
            this.handleCommentClick(e);
            this.props.handleDropdownOpened(false);
            break;

            // edit post
        case Utils.isKeyPressed(e, Constants.KeyCodes.E):
            this.handleEditMenuItemActivated(e);
            this.props.handleDropdownOpened(false);
            break;

            // follow thread
        case Utils.isKeyPressed(e, Constants.KeyCodes.F) && !isShiftKeyPressed:
            this.handleSetThreadFollow(e);
            this.props.handleDropdownOpened(false);
            break;

            // forward post
        case Utils.isKeyPressed(e, Constants.KeyCodes.F) && isShiftKeyPressed:
            this.handleForwardMenuItemActivated(e);
            this.props.handleDropdownOpened(false);
            break;

            // copy link
        case Utils.isKeyPressed(e, Constants.KeyCodes.K):
            this.copyLink(e);
            this.props.handleDropdownOpened(false);
            break;

            // copy text
        case Utils.isKeyPressed(e, Constants.KeyCodes.C):
            this.copyText(e);
            this.props.handleDropdownOpened(false);
            break;

            // delete post
        case Utils.isKeyPressed(e, Constants.KeyCodes.DELETE):
            this.handleDeleteMenuItemActivated(e);
            this.props.handleDropdownOpened(false);
            break;

            // pin / unpin
        case Utils.isKeyPressed(e, Constants.KeyCodes.P):
            this.handlePinMenuItemActivated(e);
            this.props.handleDropdownOpened(false);
            break;

            // save / unsave
        case Utils.isKeyPressed(e, Constants.KeyCodes.S):
            this.handleFlagMenuItemActivated(e);
            this.props.handleDropdownOpened(false);
            break;

            // mark as unread
        case Utils.isKeyPressed(e, Constants.KeyCodes.U):
            this.handleMarkPostAsUnread(e);
            this.props.handleDropdownOpened(false);
            break;
        }
    }

    handleDropdownOpened = (open: boolean) => {
        this.props.handleDropdownOpened?.(open);

        if (!open) {
            return;
        }

        const buttonRect = this.buttonRef.current?.getBoundingClientRect();
        let y;
        if (typeof buttonRect?.y === 'undefined') {
            y = typeof buttonRect?.top == 'undefined' ? 0 : buttonRect?.top;
        } else {
            y = buttonRect?.y;
        }
        const windowHeight = window.innerHeight;

        const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
        const spaceOnTop = y - Constants.CHANNEL_HEADER_HEIGHT;
        const spaceOnBottom = (totalSpace - (spaceOnTop + Constants.POST_AREA_HEIGHT));

        this.setState({
            openUp: (spaceOnTop > spaceOnBottom),
        });
    }

    postReminderTimes = [

        {id: 'thirty_minutes', label: 'post_info.post_reminder.sub_menu.thirty_minutes', labelDefault: '30 mins'},
        {id: 'one_hour', label: 'post_info.post_reminder.sub_menu.one_hour', labelDefault: '1 hour'},
        {id: 'two_hours', label: 'post_info.post_reminder.sub_menu.two_hours', labelDefault: '2 hours'},
        {id: 'tomorrow', label: 'post_info.post_reminder.sub_menu.tomorrow', labelDefault: 'Tomorrow'},
        {id: 'custom', label: 'post_info.post_reminder.sub_menu.custom', labelDefault: 'Custom'},
    ];

    render(): JSX.Element {
        const isFollowingThread = this.props.isFollowingThread ?? this.props.isMentionedInRootPost;
        const isMobile = this.props.isMobileView;
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const deleteShortcutText = (
            <span className='MenuItem__opacity'>
                {'delete'}
            </span>
        );

        const postReminderSubMenuItems =
            this.postReminderTimes.map(({id, label, labelDefault}) => {
                const labels = (
                    <FormattedMessage
                        id={label}
                        defaultMessage={labelDefault}
                    />
                );
                let trailing: JSX.Element | null = null;

                if (id === 'tomorrow') {
                    const tomorrow = getCurrentMomentForTimezone(this.props.timezone).add(1, 'day').toDate();
                    trailing = (
                        <span className={`postReminder-${id}_timestamp`}>
                            <FormattedDate
                                value={tomorrow}
                                weekday='short'
                            />
                            {', '}
                            <FormattedTime
                                value={tomorrow}
                                timeStyle='short'
                                hour12={!this.props.isMilitaryTime}
                            />
                        </span>
                    );
                }
                return (
                    <Menu.Item
                        key={`remind_post_options_${id}`}
                        id={`remind_post_options_${id}`}
                        labels={labels}
                        trailingElements={trailing}
                        onClick={id === 'custom' ? () => this.setCustomPostReminder() : () => this.setPostReminder(id)}
                    />
                );
            });

        this.canPostBeForwarded = !(isSystemMessage);

        const forwardPostItemText = (
            <span className={'title-with-new-badge'}>
                <FormattedMessage
                    id='forward_post_button.label'
                    defaultMessage='Forward'
                />
                {this.props.showForwardPostNewLabel && (
                    <Badge variant='success'>
                        <FormattedMessage
                            id='badge.label.new'
                            defaultMessage='NEW'
                        />
                    </Badge>
                )}
            </span>
        );

        const unFollowThreadLabel = (
            <FormattedMessage
                id='threading.threadMenu.unfollow'
                defaultMessage='Unfollow thread'
            />);

        const unFollowMessageLabel = (
            <FormattedMessage
                id='threading.threadMenu.unfollowMessage'
                defaultMessage='Unfollow message'
            />);

        const followThreadLabel = (
            <FormattedMessage
                id='threading.threadMenu.follow'
                defaultMessage='Follow thread'
            />);

        const followMessageLabel = (
            <FormattedMessage
                id='threading.threadMenu.followMessage'
                defaultMessage='Follow message'
            />);

        const followPostLabel = () => {
            if (isFollowingThread) {
                return this.props.threadReplyCount ? unFollowThreadLabel : unFollowMessageLabel;
            }
            return this.props.threadReplyCount ? followThreadLabel : followMessageLabel;
        };

        const removeFlag = (
            <FormattedMessage
                id='rhs_root.mobile.unflag'
                defaultMessage='Remove from Saved'
            />
        );

        const saveFlag = (
            <FormattedMessage
                id='rhs_root.mobile.flag'
                defaultMessage='Save'
            />
        );

        return (
            <Menu.Container
                menuButton={{
                    id: `PostDotMenu-Button-${this.props.post.id}`,
                    class: 'post-menu__item',
                    children: <DotsHorizontalIcon size={16}/>,
                }}
                menu={{
                    id: `PostDotMenu-MenuList-${this.props.post.id}`,
                }}
            >
                {!isSystemMessage && this.props.location === Locations.CENTER &&
                    <Menu.Item
                        labels={
                            <FormattedMessage
                                id='post_info.reply'
                                defaultMessage='Reply'
                            />
                        }
                        leadingElement={<ReplyOutlineIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='R'/>}
                        onClick={this.handleCommentClick}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {this.canPostBeForwarded &&
                    <Menu.Item
                        labels={forwardPostItemText}
                        leadingElement={<ArrowRightBoldOutlineIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='Shift + F'/>}
                        onClick={this.handleForwardMenuItemActivated}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                <ChannelPermissionGate
                    channelId={this.props.post.channel_id}
                    teamId={this.props.teamId}
                    permissions={[Permissions.ADD_REACTION]}
                >
                    {Boolean(isMobile && !isSystemMessage && !this.props.isReadOnly && this.props.enableEmojiPicker) &&
                        <Menu.Item
                            labels={
                                <FormattedMessage
                                    id='rhs_root.mobile.add_reaction'
                                    defaultMessage='Add Reaction'
                                />
                            }
                            leadingElement={<EmoticonPlusOutlineIcon size={18}/>}
                            onClick={this.handleAddReactionMenuItemActivated}
                            onKeyDown={this.onShortcutKeyDown}
                        />
                    }
                </ChannelPermissionGate>
                {Boolean(
                    !isSystemMessage &&
                        this.props.isCollapsedThreadsEnabled &&
                        (
                            this.props.location === Locations.CENTER ||
                            this.props.location === Locations.RHS_ROOT ||
                            this.props.location === Locations.RHS_COMMENT
                        ),
                ) &&
                    <Menu.Item
                        id={`follow_post_thread_${this.props.post.id}`}
                        trailingElements={<ShortcutKey shortcutKey='F'/>}
                        labels={followPostLabel()}
                        leadingElement={isFollowingThread ? <MessageMinusOutlineIcon size={18}/> : <MessageCheckOutlineIcon size={18}/>}
                        onClick={this.handleSetThreadFollow}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {Boolean(!isSystemMessage && !this.props.channelIsArchived && this.props.location !== Locations.SEARCH) &&
                    <Menu.Item
                        id={`unread_post_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.unread'
                                defaultMessage='Mark as Unread'
                            />
                        }
                        leadingElement={<MarkAsUnreadIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='U'/>}
                        onClick={this.handleMarkPostAsUnread}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {!isSystemMessage &&
                    <Menu.SubMenu
                        id={`remind_post_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.post_reminder.menu'
                                defaultMessage='Remind'
                            />
                        }
                        leadingElement={<ClockOutlineIcon size={18}/>}
                        trailingElements={<ArrowForwardIosIcon size={16}/>}
                        menuId={`remind_post_${this.props.post.id}-menu`}
                        forceOpenOnLeft={true}
                    >
                        <h5 className={'postReminderMenuHeader'}>
                            {Utils.localizeMessage('post_info.post_reminder.sub_menu.header', 'Set a reminder for:')}
                        </h5>
                        {postReminderSubMenuItems}
                    </Menu.SubMenu>
                }
                {!isSystemMessage &&
                    <Menu.Item
                        labels={this.props.isFlagged ? removeFlag : saveFlag}
                        leadingElement={this.props.isFlagged ? <BookmarkIcon size={18}/> : <BookmarkOutlineIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='S'/>}
                        onClick={this.handleFlagMenuItemActivated}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {Boolean(!isSystemMessage && !this.props.isReadOnly && this.props.post.is_pinned) &&
                    <Menu.Item
                        id={`unpin_post_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.unpin'
                                defaultMessage='Unpin'
                            />}
                        leadingElement={<PinIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='P'/>}
                        onClick={this.handlePinMenuItemActivated}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {Boolean(!isSystemMessage && !this.props.isReadOnly && !this.props.post.is_pinned) &&
                    <Menu.Item
                        id={`pin_post_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.pin'
                                defaultMessage='Pin'
                            />}
                        leadingElement={<PinOutlineIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='P'/>}
                        onClick={this.handlePinMenuItemActivated}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {!isSystemMessage && (this.state.canEdit || this.state.canDelete) && this.renderDivider('edit')}
                {!isSystemMessage &&
                    <Menu.Item
                        id={`permalink_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.permalink'
                                defaultMessage='Copy Link'
                            />}
                        leadingElement={<LinkVariantIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='K'/>}
                        onClick={this.copyLink}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {!isSystemMessage && this.renderDivider('edit')}
                {this.state.canEdit &&
                    <Menu.Item
                        id={`edit_post_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.edit'
                                defaultMessage='Edit'
                            />}
                        leadingElement={<PencilOutlineIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='E'/>}
                        onClick={this.handleEditMenuItemActivated}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {!isSystemMessage &&
                    <Menu.Item
                        id={`copy_${this.props.post.id}`}
                        labels={
                            <FormattedMessage
                                id='post_info.copy'
                                defaultMessage='Copy Text'
                            />}
                        leadingElement={<ContentCopyIcon size={18}/>}
                        trailingElements={<ShortcutKey shortcutKey='C'/>}
                        onClick={this.copyText}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
                {this.state.canDelete &&
                    <Menu.Item
                        id={`delete_post_${this.props.post.id}`}
                        leadingElement={<TrashCanOutlineIcon size={18}/>}
                        trailingElements={deleteShortcutText}
                        labels={
                            <FormattedMessage
                                id='post_info.del'
                                defaultMessage='Delete'
                            />}
                        onClick={this.handleDeleteMenuItemActivated}
                        isDestructive={true}
                        onKeyDown={this.onShortcutKeyDown}
                    />
                }
            </Menu.Container>
        );
    }
}

export default injectIntl(DotMenuClass);
