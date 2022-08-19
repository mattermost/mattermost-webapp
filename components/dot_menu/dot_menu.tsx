// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';
import {Post} from '@mattermost/types/posts';
import {UserThread} from '@mattermost/types/threads';

import {Locations, ModalIdentifiers, Constants, TELEMETRY_LABELS, Preferences} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import DelayedAction from 'utils/delayed_action';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import DotsHorizontalIcon from 'components/widgets/icons/dots_horizontal';
import {ModalData} from 'types/actions';
import {PluginComponent} from 'types/store/plugins';
import ForwardPostModal from '../forward_post_modal';
import Badge from '../widgets/badges/badge';

import {ChangeEvent, trackDotMenuEvent} from './utils';
import './dot_menu.scss';

type ShortcutFunc = (e: KeyboardEvent) => void
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
    handleCommentClick: React.EventHandler<any>;
    handleDropdownOpened: (open: boolean) => void;
    handleAddReactionClick?: () => void;
    isMenuOpen?: boolean;
    isReadOnly: boolean | null;
    isLicensed?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    postEditTimeLimit?: string; // TechDebt: Made non-mandatory while converting to typescript
    enableEmojiPicker?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    channelIsArchived?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    currentTeamUrl?: string; // TechDebt: Made non-mandatory while converting to typescript
    teamUrl?: string; // TechDebt: Made non-mandatory while converting to typescript
    isMobileView: boolean;
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
         * Function to set a global storage item on the store
         */
        setGlobalItem: (name: string, value: any) => void;

    }; // TechDebt: Made non-mandatory while converting to typescript

    canEdit: boolean;
    canDelete: boolean;
    userId: string;
    threadId: UserThread['id'];
    isCollapsedThreadsEnabled: boolean;
    isPostForwardingEnabled?: boolean;
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

    componentDidUpdate(prevProps: Props): void {
        if (!prevProps.isMenuOpen && this.props.isMenuOpen) {
            window.addEventListener('keydown', this.onShortcutKeyDown);
        }

        if (prevProps.isMenuOpen && !this.props.isMenuOpen) {
            window.removeEventListener('keydown', this.onShortcutKeyDown);
        }
    }

    componentWillUnmount(): void {
        window.removeEventListener('keydown', this.onShortcutKeyDown);
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
        this.props.handleCommentClick(e);
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

    isKeyboardEvent = (e: KeyboardEvent): any => {
        return (e).getModifierState !== undefined;
    }

    handleShortCut = (e: KeyboardEvent, f: ShortcutFunc) => {
        e.preventDefault();
        f(e);
        this.props.handleDropdownOpened(false);
    }

    onShortcutKeyDown = (e: KeyboardEvent): void => {
        if (!this.isKeyboardEvent(e)) {
            return;
        }

        const isShiftKeyPressed = e.shiftKey;
        const shortcuts: Array<[[string, number], (e: KeyboardEvent) => void, (undefined | boolean)?]> = [
            [Constants.KeyCodes.C, this.copyText],
            [Constants.KeyCodes.DELETE, this.handleDeleteMenuItemActivated],
            [Constants.KeyCodes.E, this.handleEditMenuItemActivated],
            [Constants.KeyCodes.F, this.handleForwardMenuItemActivated, isShiftKeyPressed],
            [Constants.KeyCodes.F, this.handleSetThreadFollow, !isShiftKeyPressed],
            [Constants.KeyCodes.K, this.copyLink],
            [Constants.KeyCodes.P, this.handlePinMenuItemActivated],
            [Constants.KeyCodes.R, this.handleCommentClick],
            [Constants.KeyCodes.S, this.handleFlagMenuItemActivated],
            [Constants.KeyCodes.U, this.handleMarkPostAsUnread],
        ];

        for (const [keyCode, func, condition] of shortcuts) {
            const conditionMet = (!condition) || (typeof condition === 'boolean' && condition);
            if (Utils.isKeyPressed(e, keyCode) && conditionMet) {
                this.handleShortCut(e, func);
                break;
            }
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

    render(): JSX.Element {
        const isFollowingThread = this.props.isFollowingThread ?? this.props.isMentionedInRootPost;
        const isMobile = this.props.isMobileView;
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const deleteShortcutText = (
            <span className='MenuItem__opacity'>
                {'delete'}
            </span>
        );

        const fromWebhook = this.props.post.props?.from_webhook === 'true';
        const fromBot = this.props.post.props?.from_bot === 'true';
        this.canPostBeForwarded = Boolean(this.props.isPostForwardingEnabled && !(fromWebhook || fromBot || isSystemMessage));

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

        return (
            <MenuWrapper
                open={this.props.isMenuOpen}
                onToggle={this.handleDropdownOpened}
                className={'dropdown-menu__dotmenu'}
            >
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={500}
                    placement='top'
                    overlay={this.tooltip}
                    rootClose={true}
                >
                    <button
                        ref={this.buttonRef}
                        id={`${this.props.location}_button_${this.props.post.id}`}
                        aria-label={Utils.localizeMessage('post_info.dot_menu.tooltip.more_actions', 'Actions').toLowerCase()}
                        className={classNames('post-menu__item', {
                            'post-menu__item--active': this.props.isMenuOpen,
                        })}
                        type='button'
                        aria-expanded='false'
                    >
                        <DotsHorizontalIcon className={'icon icon--small'}/>
                    </button>
                </OverlayTrigger>
                <Menu
                    className={'Menu__content dropdown-menu'}
                    id={`${this.props.location}_dropdown_${this.props.post.id}`}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                >
                    <Menu.ItemAction
                        className={'MenuItem'}
                        show={!isSystemMessage && this.props.location === Locations.CENTER}
                        text={Utils.localizeMessage('post_info.reply', 'Reply')}
                        icon={Utils.getMenuItemIcon('icon-reply-outline')}
                        rightDecorator={<ShortcutKey shortcutKey='R'/>}
                        onClick={this.handleCommentClick}
                    />
                    <Menu.ItemAction
                        className={'MenuItem'}
                        show={this.canPostBeForwarded}
                        text={forwardPostItemText}
                        icon={Utils.getMenuItemIcon('icon-arrow-right-bold-outline')}
                        rightDecorator={<ShortcutKey shortcutKey='Shift + F'/>}
                        onClick={this.handleForwardMenuItemActivated}
                    />
                    <ChannelPermissionGate
                        channelId={this.props.post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <Menu.ItemAction
                            show={isMobile && !isSystemMessage && !this.props.isReadOnly && this.props.enableEmojiPicker}
                            text={Utils.localizeMessage('rhs_root.mobile.add_reaction', 'Add Reaction')}
                            icon={Utils.getMenuItemIcon('icon-emoticon-plus-outline')}
                            onClick={this.handleAddReactionMenuItemActivated}
                        />
                    </ChannelPermissionGate>
                    <Menu.ItemAction
                        id={`follow_post_thread_${this.props.post.id}`}
                        rightDecorator={<ShortcutKey shortcutKey='F'/>}
                        onClick={this.handleSetThreadFollow}
                        show={(
                            !isSystemMessage &&
                            this.props.isCollapsedThreadsEnabled &&
                                (
                                    this.props.location === Locations.CENTER ||
                                    this.props.location === Locations.RHS_ROOT ||
                                    this.props.location === Locations.RHS_COMMENT
                                )
                        )}
                        {...isFollowingThread ? {
                            icon: Utils.getMenuItemIcon('icon-message-minus-outline'),
                            text: this.props.threadReplyCount ? Utils.localizeMessage('threading.threadMenu.unfollow', 'Unfollow thread') : Utils.localizeMessage('threading.threadMenu.unfollowMessage', 'Unfollow message'),
                        } : {
                            icon: Utils.getMenuItemIcon('icon-message-check-outline'),
                            text: this.props.threadReplyCount ? Utils.localizeMessage('threading.threadMenu.follow', 'Follow thread') : Utils.localizeMessage('threading.threadMenu.followMessage', 'Follow message'),
                        }}
                    />
                    <Menu.ItemAction
                        id={`unread_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.channelIsArchived && this.props.location !== Locations.SEARCH}
                        text={Utils.localizeMessage('post_info.unread', 'Mark as Unread')}
                        icon={Utils.getMenuItemIcon('icon-mark-as-unread')}
                        rightDecorator={<ShortcutKey shortcutKey='U'/>}
                        onClick={this.handleMarkPostAsUnread}
                    />
                    <Menu.ItemAction
                        show={isMobile && !isSystemMessage && this.props.isFlagged}
                        text={Utils.localizeMessage('rhs_root.mobile.unflag', 'Remove from Saved')}
                        icon={Utils.getMenuItemIcon('icon-bookmark')}
                        rightDecorator={<ShortcutKey shortcutKey='S'/>}
                        onClick={this.handleFlagMenuItemActivated}
                    />
                    <Menu.ItemAction
                        show={isMobile && !isSystemMessage && !this.props.isFlagged}
                        text={Utils.localizeMessage('rhs_root.mobile.flag', 'Save')}
                        icon={Utils.getMenuItemIcon('icon-bookmark-outline')}
                        rightDecorator={<ShortcutKey shortcutKey='S'/>}
                        onClick={this.handleFlagMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`unpin_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.isReadOnly && this.props.post.is_pinned}
                        text={Utils.localizeMessage('post_info.unpin', 'Unpin')}
                        icon={Utils.getMenuItemIcon('icon-pin')}
                        rightDecorator={<ShortcutKey shortcutKey='P'/>}
                        onClick={this.handlePinMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`pin_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.isReadOnly && !this.props.post.is_pinned}
                        text={Utils.localizeMessage('post_info.pin', 'Pin')}
                        icon={Utils.getMenuItemIcon('icon-pin-outline')}
                        rightDecorator={<ShortcutKey shortcutKey='P'/>}
                        onClick={this.handlePinMenuItemActivated}
                    />
                    {!isSystemMessage && (this.state.canEdit || this.state.canDelete) && this.renderDivider('edit')}
                    <Menu.ItemAction
                        id={`permalink_${this.props.post.id}`}
                        show={!isSystemMessage}
                        text={Utils.localizeMessage('post_info.permalink', 'Copy Link')}
                        icon={Utils.getMenuItemIcon('icon-link-variant')}
                        rightDecorator={<ShortcutKey shortcutKey='K'/>}
                        onClick={this.copyLink}
                    />
                    {!isSystemMessage && this.renderDivider('edit')}
                    <Menu.ItemAction
                        id={`edit_post_${this.props.post.id}`}
                        show={this.state.canEdit}
                        text={Utils.localizeMessage('post_info.edit', 'Edit')}
                        icon={Utils.getMenuItemIcon('icon-pencil-outline')}
                        rightDecorator={<ShortcutKey shortcutKey='E'/>}
                        onClick={this.handleEditMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`copy_${this.props.post.id}`}
                        show={!isSystemMessage}
                        text={Utils.localizeMessage('post_info.copy', 'Copy Text')}
                        icon={Utils.getMenuItemIcon('icon-content-copy')}
                        rightDecorator={<ShortcutKey shortcutKey='C'/>}
                        onClick={this.copyText}
                    />
                    <Menu.ItemAction
                        id={`delete_post_${this.props.post.id}`}
                        show={this.state.canDelete}
                        text={Utils.localizeMessage('post_info.del', 'Delete')}
                        icon={Utils.getMenuItemIcon('icon-trash-can-outline', true)}
                        rightDecorator={deleteShortcutText}
                        onClick={this.handleDeleteMenuItemActivated}
                        isDangerous={true}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(DotMenuClass);
