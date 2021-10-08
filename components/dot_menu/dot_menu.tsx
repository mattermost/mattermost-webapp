// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import Permissions from 'mattermost-redux/constants/permissions';
import {Post} from 'mattermost-redux/types/posts';
import {AppBinding, AppCallRequest, AppForm} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';
import {UserThread} from 'mattermost-redux/types/threads';
import {Team} from 'mattermost-redux/types/teams';
import {$ID} from 'mattermost-redux/types/utilities';

import {DoAppCall, PostEphemeralCallResponseForPost} from 'types/apps';
import {Locations, ModalIdentifiers, Constants} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import OverlayTrigger from 'components/overlay_trigger';
import DelayedAction from 'utils/delayed_action';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import Pluggable from 'plugins/pluggable';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import DotsHorizontalIcon from 'components/widgets/icons/dots_horizontal';
import {PluginComponent} from 'types/store/plugins';
import {createCallContext, createCallRequest} from 'utils/apps';

const MENU_BOTTOM_MARGIN = 80;

export const PLUGGABLE_COMPONENT = 'PostDropdownMenuItem';
type Props = {
    intl: IntlShape;
    post: Post;
    teamId?: string;
    location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | 'SEARCH' | string;
    isFlagged?: boolean;
    handleCommentClick?: React.EventHandler<React.MouseEvent>;
    handleDropdownOpened?: (open: boolean) => void;
    handleAddReactionClick?: () => void;
    isMenuOpen?: boolean;
    isReadOnly: boolean | null;
    pluginMenuItems?: PluginComponent[];
    isLicensed?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    postEditTimeLimit?: string; // TechDebt: Made non-mandatory while converting to typescript
    enableEmojiPicker?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    channelIsArchived?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    currentTeamUrl?: string; // TechDebt: Made non-mandatory while converting to typescript
    appBindings: AppBinding[] | null;
    appsEnabled: boolean;

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
        openModal: (postId: any) => void;

        /**
         * Function to set the unread mark at given post
         */
        markPostAsUnread: (post: Post, location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | string) => void;

        /**
         * Function to perform an app call
         */
        doAppCall: DoAppCall;

        /**
         * Function to post the ephemeral message for a call response
         */
        postEphemeralCallResponseForPost: PostEphemeralCallResponseForPost;

        /**
         * Function to set the thread as followed/unfollowed
         */
        setThreadFollow: (userId: string, teamId: string, threadId: string, newState: boolean) => void;

        openAppsModal: (form: AppForm, call: AppCallRequest) => void;

        /**
         * Function to get the post menu bindings for this post.
         */
        fetchBindings: (userId: string, channelId: string, teamId: string) => Promise<{data: AppBinding[]}>;

    }; // TechDebt: Made non-mandatory while converting to typescript

    canEdit: boolean;
    canDelete: boolean;
    userId: string;
    currentTeamId: $ID<Team>;
    threadId: $ID<UserThread>;
    isCollapsedThreadsEnabled: boolean;
    isFollowingThread?: boolean;
    threadReplyCount?: number;
}

type State = {
    openUp: boolean;
    canEdit: boolean;
    canDelete: boolean;
    appBindings?: AppBinding[];
}

export class DotMenuClass extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        isFlagged: false,
        isReadOnly: false,
        location: Locations.CENTER,
        pluginMenuItems: [],
        appBindings: [],
    }
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

    disableCanEditPostByTime() {
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

    componentDidMount() {
        this.disableCanEditPostByTime();
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.state.appBindings && this.props.isMenuOpen && !prevProps.isMenuOpen) {
            this.fetchBindings();
        }
    }

    static getDerivedStateFromProps(props: Props) {
        const state: Partial<State> = {
            canEdit: props.canEdit && !props.isReadOnly,
            canDelete: props.canDelete && !props.isReadOnly,
        };
        if (props.appBindings) {
            state.appBindings = props.appBindings;
        }
        return state;
    }

    componentWillUnmount() {
        this.editDisableAction.cancel();
    }

    handleEditDisable = () => {
        this.setState({canEdit: false});
    }

    handleFlagMenuItemActivated = () => {
        if (this.props.isFlagged) {
            this.props.actions.unflagPost(this.props.post.id);
        } else {
            this.props.actions.flagPost(this.props.post.id);
        }
    }

    // listen to clicks/taps on add reaction menu item and pass to parent handler
    handleAddReactionMenuItemActivated = (e: React.MouseEvent) => {
        e.preventDefault();

        // to be safe, make sure the handler function has been defined
        if (this.props.handleAddReactionClick) {
            this.props.handleAddReactionClick();
        }
    }

    copyLink = () => {
        Utils.copyToClipboard(`${this.props.currentTeamUrl}/pl/${this.props.post.id}`);
    }

    handlePinMenuItemActivated = () => {
        if (this.props.post.is_pinned) {
            this.props.actions.unpinPost(this.props.post.id);
        } else {
            this.props.actions.pinPost(this.props.post.id);
        }
    }

    handleUnreadMenuItemActivated = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.markPostAsUnread(this.props.post, this.props.location);
    }

    handleDeleteMenuItemActivated = (e: React.MouseEvent) => {
        e.preventDefault();

        const deletePostModalData = {
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: this.props.post,
                isRHS: this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
            },
        };

        this.props.actions.openModal(deletePostModalData);
    }

    handleEditMenuItemActivated = () => {
        this.props.actions.setEditingPost(
            this.props.post.id,
            this.props.location === Locations.CENTER ? 'post_textbox' : 'reply_textbox',
            this.props.post.root_id ? Utils.localizeMessage('rhs_comment.comment', 'Comment') : Utils.localizeMessage('create_post.post', 'Post'),
            this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
        );
    }

    handleSetThreadFollow = () => {
        const {actions, currentTeamId, threadId, userId, isFollowingThread} = this.props;
        actions.setThreadFollow(
            userId,
            currentTeamId,
            threadId,
            !isFollowingThread,
        );
    }

    tooltip = (
        <Tooltip
            id='dotmenu-icon-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='post_info.dot_menu.tooltip.more_actions'
                defaultMessage='More actions'
            />
        </Tooltip>
    )

    refCallback = (menuRef: Menu) => {
        if (menuRef) {
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
    }

    renderDivider = (suffix: string) => {
        return (
            <li
                id={`divider_post_${this.props.post.id}_${suffix}`}
                className='MenuItem__divider'
                role='menuitem'
            />
        );
    }

    onClickAppBinding = async (binding: AppBinding) => {
        const {post, intl} = this.props;

        const call = binding.form?.call || binding.call;

        if (!call) {
            return;
        }
        const context = createCallContext(
            binding.app_id,
            binding.location,
            this.props.post.channel_id,
            this.props.teamId,
            this.props.post.id,
            this.props.post.root_id,
        );
        const callRequest = createCallRequest(
            call,
            context,
            {
                post: AppExpandLevels.ALL,
            },
        );

        if (binding.form) {
            this.props.actions.openAppsModal(binding.form, callRequest);
            return;
        }

        const res = await this.props.actions.doAppCall(callRequest, AppCallTypes.SUBMIT, intl);

        if (res.error) {
            const errorResponse = res.error;
            const errorMessage = errorResponse.error || intl.formatMessage({
                id: 'apps.error.unknown',
                defaultMessage: 'Unknown error occurred.',
            });
            this.props.actions.postEphemeralCallResponseForPost(errorResponse, errorMessage, post);
            return;
        }

        const callResp = res.data!;
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.markdown) {
                this.props.actions.postEphemeralCallResponseForPost(callResp, callResp.markdown, post);
            }
            break;
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.FORM:
            break;
        default: {
            const errorMessage = intl.formatMessage({
                id: 'apps.error.responses.unknown_type',
                defaultMessage: 'App response type not supported. Response type: {type}.',
            }, {
                type: callResp.type,
            });
            this.props.actions.postEphemeralCallResponseForPost(callResp, errorMessage, post);
        }
        }
    }

    fetchBindings = () => {
        this.props.actions.fetchBindings(this.props.userId, this.props.post.channel_id, this.props.currentTeamId).then(({data}) => {
            this.setState({appBindings: data});
        });
    }

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();

        const pluginItems = this.props.pluginMenuItems?.
            filter((item) => {
                return item.filter ? item.filter(this.props.post.id) : item;
            }).
            map((item) => {
                if (item.subMenu) {
                    return (
                        <Menu.ItemSubMenu
                            key={item.id + '_pluginmenuitem'}
                            id={item.id}
                            postId={this.props.post.id}
                            text={item.text}
                            subMenu={item.subMenu}
                            action={item.action}
                            root={true}
                        />
                    );
                }
                return (
                    <Menu.ItemAction
                        key={item.id + '_pluginmenuitem'}
                        text={item.text}
                        onClick={() => {
                            if (item.action) {
                                item.action(this.props.post.id);
                            }
                        }}
                    />
                );
            }) || [];

        let appBindings = [] as JSX.Element[];
        if (this.props.appsEnabled && this.state.appBindings) {
            appBindings = this.state.appBindings.map((item) => {
                let icon: JSX.Element | undefined;
                if (item.icon) {
                    icon = (<img src={item.icon}/>);
                }

                return (
                    <Menu.ItemAction
                        text={item.label}
                        key={item.app_id + item.location}
                        onClick={() => this.onClickAppBinding(item)}
                        icon={icon}
                    />
                );
            });
        }

        if (!this.state.canDelete && !this.state.canEdit && typeof pluginItems !== 'undefined' && pluginItems.length === 0 && isSystemMessage) {
            return null;
        }

        return (
            <MenuWrapper onToggle={this.props.handleDropdownOpened}>
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
                        aria-label={Utils.localizeMessage('post_info.dot_menu.tooltip.more_actions', 'More actions').toLowerCase()}
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
                    id={`${this.props.location}_dropdown_${this.props.post.id}`}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ref={this.refCallback}
                    ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                >
                    <Menu.ItemAction
                        show={!isSystemMessage && this.props.location === Locations.CENTER}
                        text={Utils.localizeMessage('post_info.reply', 'Reply')}
                        onClick={this.props.handleCommentClick}
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
                            text: this.props.threadReplyCount ? Utils.localizeMessage('threading.threadMenu.unfollow', 'Unfollow thread') : Utils.localizeMessage('threading.threadMenu.unfollowMessage', 'Unfollow message'),
                            extraText: Utils.localizeMessage('threading.threadMenu.unfollowExtra', 'You won’t be notified about replies'),
                        } : {
                            text: this.props.threadReplyCount ? Utils.localizeMessage('threading.threadMenu.follow', 'Follow thread') : Utils.localizeMessage('threading.threadMenu.followMessage', 'Follow message'),
                            extraText: Utils.localizeMessage('threading.threadMenu.followExtra', 'You will be notified about replies'),
                        }}
                    />
                    <Menu.ItemAction
                        id={`unread_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.channelIsArchived && this.props.location !== Locations.SEARCH}
                        text={Utils.localizeMessage('post_info.unread', 'Mark as Unread')}
                        onClick={this.handleUnreadMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`permalink_${this.props.post.id}`}
                        show={!isSystemMessage}
                        text={Utils.localizeMessage('post_info.permalink', 'Copy Link')}
                        onClick={this.copyLink}
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
                        onClick={this.handlePinMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`pin_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.isReadOnly && !this.props.post.is_pinned}
                        text={Utils.localizeMessage('post_info.pin', 'Pin')}
                        onClick={this.handlePinMenuItemActivated}
                    />
                    {!isSystemMessage && (this.state.canEdit || this.state.canDelete) && this.renderDivider('edit')}
                    <Menu.ItemAction
                        id={`edit_post_${this.props.post.id}`}
                        show={this.state.canEdit}
                        text={Utils.localizeMessage('post_info.edit', 'Edit')}
                        onClick={this.handleEditMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`delete_post_${this.props.post.id}`}
                        show={this.state.canDelete}
                        text={Utils.localizeMessage('post_info.del', 'Delete')}
                        onClick={this.handleDeleteMenuItemActivated}
                        isDangerous={true}
                    />
                    {((typeof pluginItems !== 'undefined' && pluginItems.length > 0) || appBindings.length > 0 || (this.props.components[PLUGGABLE_COMPONENT] && this.props.components[PLUGGABLE_COMPONENT].length > 0)) && this.renderDivider('plugins')}
                    {pluginItems}
                    {appBindings}
                    <Pluggable
                        postId={this.props.post.id}
                        pluggableName={PLUGGABLE_COMPONENT}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(DotMenuClass);
