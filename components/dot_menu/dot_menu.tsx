// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';

import {Locations, ModalIdentifiers, Constants, TELEMETRY_LABELS} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import DelayedAction from 'utils/delayed_action';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import DotsHorizontalIcon from 'components/widgets/icons/dots_horizontal';
import {ModalData} from 'types/actions';
import {PluginComponent} from 'types/store/plugins';

import {ChangeEvent, trackDotMenuEvent} from './utils';

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
    private keysHeldDown: string[] = [];
    private editDisableAction: DelayedAction;
    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.editDisableAction = new DelayedAction(this.handleEditDisable);

        this.state = {
            openUp: false,
            canEdit: props.canEdit && !props.isReadOnly,
            canDelete: props.canDelete && !props.isReadOnly,
        };

        this.buttonRef = React.createRef<HTMLButtonElement>();
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
            window.addEventListener('keyup', this.onShortcutKeyUp);
        }

        if (prevProps.isMenuOpen && !this.props.isMenuOpen) {
            window.removeEventListener('keydown', this.onShortcutKeyDown);
            window.removeEventListener('keyup', this.onShortcutKeyUp);
        }
    }

    componentWillUnmount(): void {
        window.removeEventListener('keydown', this.onShortcutKeyDown);
        window.removeEventListener('keyup', this.onShortcutKeyUp);
        this.editDisableAction.cancel();
    }

    handleEditDisable = (): void => {
        this.setState({canEdit: false});
    }

    handleFlagMenuItemActivated = (): void => {
        if (this.props.isFlagged) {
            this.props.actions.unflagPost(this.props.post.id);
        } else {
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
        if (isFollowingThread) {
            trackDotMenuEvent(e, TELEMETRY_LABELS.UNFOLLOW);
            followingThread = !isFollowingThread;
        } else {
            trackDotMenuEvent(e, TELEMETRY_LABELS.FOLLOW);
            followingThread = !isMentionedInRootPost;
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

    onShortcutKeyDown = (e: KeyboardEvent): void => {
        e.preventDefault();
        if (!this.isKeyboardEvent(e)) {
            return;
        }

        if (this.keysHeldDown.includes(e.key)) {
            return;
        }
        this.keysHeldDown.push(e.key);

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
        case Utils.isKeyPressed(e, Constants.KeyCodes.F):
            this.handleSetThreadFollow(e);
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

        // mark as unread
        case Utils.isKeyPressed(e, Constants.KeyCodes.U):
            this.handleMarkPostAsUnread(e);
            this.props.handleDropdownOpened(false);
            break;
        }
    }

    onShortcutKeyUp = (e: KeyboardEvent): void => {
        e.preventDefault();
        this.keysHeldDown = this.keysHeldDown.filter((key) => key !== e.key);
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
        const isMobile = this.props.isMobileView;
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const deleteShortcutText = (
            <span className='MenuItem__opacity'>
                {'delete'}
            </span>
        );

        return (
            <MenuWrapper
                open={this.props.isMenuOpen}
                onToggle={this.handleDropdownOpened}
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
                    className={'status-dropdown-menu-global-header'}
                    id={`${this.props.location}_dropdown_${this.props.post.id}`}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                >
                    <Menu.ItemAction
                        show={!isSystemMessage && this.props.location === Locations.CENTER}
                        text={Utils.localizeMessage('post_info.reply', 'Reply')}
                        icon={Utils.getMenuItemIcon('icon-reply-outline')}
                        rightDecorator={<ShortcutKey shortcutKey='R'/>}
                        onClick={this.handleCommentClick}
                    />
                    <ChannelPermissionGate
                        channelId={this.props.post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <Menu.ItemAction
                            show={isMobile && !isSystemMessage && !this.props.isReadOnly && this.props.enableEmojiPicker}
                            text={Utils.localizeMessage('rhs_root.mobile.add_reaction', 'Add Reaction')}
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
                        {...this.props.isFollowingThread ? {
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
                        onClick={this.handleFlagMenuItemActivated}
                    />
                    <Menu.ItemAction
                        show={isMobile && !isSystemMessage && !this.props.isFlagged}
                        text={Utils.localizeMessage('rhs_root.mobile.flag', 'Save')}
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

                        //  rightDecorator={'delete'}
                        onClick={this.handleDeleteMenuItemActivated}
                        isDangerous={true}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(DotMenuClass);
