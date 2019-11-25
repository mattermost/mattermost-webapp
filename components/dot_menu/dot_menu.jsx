// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import Permissions from 'mattermost-redux/constants/permissions';

import {showGetPostLinkModal} from 'actions/global_actions.jsx';
import {Locations, ModalIdentifiers, Constants} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import DelayedAction from 'utils/delayed_action';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

import Pluggable from 'plugins/pluggable';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

const MENU_BOTTOM_MARGIN = 80;

export default class DotMenu extends Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        teamId: PropTypes.string,
        location: PropTypes.oneOf([Locations.CENTER, Locations.RHS_ROOT, Locations.RHS_COMMENT, Locations.SEARCH]).isRequired,
        commentCount: PropTypes.number,
        isFlagged: PropTypes.bool,
        handleCommentClick: PropTypes.func,
        handleDropdownOpened: PropTypes.func,
        handleAddReactionClick: PropTypes.func,
        isReadOnly: PropTypes.bool,
        pluginMenuItems: PropTypes.arrayOf(PropTypes.object),
        isLicensed: PropTypes.bool.isRequired,
        postEditTimeLimit: PropTypes.string.isRequired,
        enableEmojiPicker: PropTypes.bool.isRequired,
        actions: PropTypes.shape({

            /**
             * Function flag the post
             */
            flagPost: PropTypes.func.isRequired,

            /**
             * Function to unflag the post
             */
            unflagPost: PropTypes.func.isRequired,

            /**
             * Function to set the editing post
             */
            setEditingPost: PropTypes.func.isRequired,

            /**
             * Function to pin the post
             */
            pinPost: PropTypes.func.isRequired,

            /**
             * Function to unpin the post
             */
            unpinPost: PropTypes.func.isRequired,

            /**
             * Function to open a modal
             */
            openModal: PropTypes.func.isRequired,

            /*
             * Function to set the unread mark at given post
             */
            markPostAsUnread: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        post: {},
        commentCount: 0,
        isFlagged: false,
        isReadOnly: false,
        pluginMenuItems: [],
        location: Locations.CENTER,
        enableEmojiPicker: false,
    }

    constructor(props) {
        super(props);

        this.editDisableAction = new DelayedAction(this.handleEditDisable);

        this.state = {
            openUp: false,
            width: 0,
        };

        this.buttonRef = React.createRef();
    }

    disableCanEditPostByTime() {
        const {post, isLicensed, postEditTimeLimit} = this.props;
        const canEdit = PostUtils.canEditPost(post);

        if (canEdit && isLicensed) {
            if (String(postEditTimeLimit) !== String(Constants.UNSET_POST_EDIT_TIME_LIMIT)) {
                const milliseconds = 1000;
                const timeLeft = (post.create_at + (postEditTimeLimit * milliseconds)) - Utils.getTimestamp();
                if (timeLeft > 0) {
                    this.editDisableAction.fireAfter(timeLeft + milliseconds);
                }
            }
        }
    }

    componentDidMount() {
        this.disableCanEditPostByTime();
    }

    static getDerivedStateFromProps(props) {
        return {
            canDelete: PostUtils.canDeletePost(props.post) && !props.isReadOnly,
            canEdit: PostUtils.canEditPost(props.post) && !props.isReadOnly,
        };
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
    handleAddReactionMenuItemActivated = (e) => {
        e.preventDefault();

        // to be safe, make sure the handler function has been defined
        if (this.props.handleAddReactionClick) {
            this.props.handleAddReactionClick();
        }
    }

    handlePermalinkMenuItemActivated = (e) => {
        e.preventDefault();
        showGetPostLinkModal(this.props.post);
    }

    handlePinMenuItemActivated = () => {
        if (this.props.post.is_pinned) {
            this.props.actions.unpinPost(this.props.post.id);
        } else {
            this.props.actions.pinPost(this.props.post.id);
        }
    }

    handleUnreadMenuItemActivated = (e) => {
        e.preventDefault();
        this.props.actions.markPostAsUnread(this.props.post);
    }

    handleDeleteMenuItemActivated = (e) => {
        e.preventDefault();

        const deletePostModalData = {
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: this.props.post,
                commentCount: this.props.commentCount,
                isRHS: this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
            },
        };

        this.props.actions.openModal(deletePostModalData);
    }

    handleEditMenuItemActivated = () => {
        this.props.actions.setEditingPost(
            this.props.post.id,
            this.props.commentCount,
            this.props.location === Locations.CENTER ? 'post_textbox' : 'reply_textbox',
            this.props.post.root_id ? Utils.localizeMessage('rhs_comment.comment', 'Comment') : Utils.localizeMessage('create_post.post', 'Post'),
            this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
        );
    }

    tooltip = (
        <Tooltip
            id='dotmenu-icon-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='post_info.dot_menu.tooltip.more_actions'
                defaultMessage='More Actions'
            />
        </Tooltip>
    )

    refCallback = (ref) => {
        if (ref) {
            const rect = ref.rect();
            const y = rect.y || rect.top;
            const height = rect.height;
            const windowHeight = window.innerHeight;

            if ((y + height) > (windowHeight - MENU_BOTTOM_MARGIN)) {
                this.setState({openUp: true});
            }

            this.setState({width: rect.width});
        }
    }

    renderDivider = (suffix) => {
        return (
            <li
                id={`divider_post_${this.props.post.id}_${suffix}`}
                className='MenuItem__divider'
                role='menuitem'
            />
        );
    }

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();

        const pluginItems = this.props.pluginMenuItems.
            filter((item) => {
                return item.filter ? item.filter(this.props.post.id) : item;
            }).
            map((item) => {
                if (item.subMenu) {
                    return (
                        <Menu.ItemSubMenu
                            key={item.id + '_pluginmenuitem'}
                            id={item.text.id}
                            postId={this.props.post.id}
                            text={item.text}
                            subMenu={item.subMenu}
                            action={item.action}
                            xOffset={this.state.width}
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
            });

        if (!this.state.canDelete && !this.state.canEdit && pluginItems.length === 0 && isSystemMessage) {
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
                        id={`${this.props.location}_button_${this.props.post.id}`}
                        aria-label={Utils.localizeMessage('post_info.dot_menu.tooltip.more_actions', 'More Actions').toLowerCase()}
                        className='post__dropdown color--link style--none'
                        type='button'
                        aria-expanded='false'
                    />
                </OverlayTrigger>
                <Menu
                    id={`${this.props.location}_dropdown_${this.props.post.id}`}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ref={this.refCallback}
                    ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                >
                    <Menu.Group>
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
                            id={`unread_post_${this.props.post.id}`}
                            show={!isSystemMessage}
                            text={Utils.localizeMessage('post_info.unread', 'Mark as Unread')}
                            onClick={this.handleUnreadMenuItemActivated}
                        />
                        <Menu.ItemAction
                            id={`permalink_${this.props.post.id}`}
                            show={!isSystemMessage}
                            text={Utils.localizeMessage('post_info.permalink', 'Permalink')}
                            onClick={this.handlePermalinkMenuItemActivated}
                        />
                        <Menu.ItemAction
                            show={isMobile && !isSystemMessage && this.props.isFlagged}
                            text={Utils.localizeMessage('rhs_root.mobile.unflag', 'Unflag')}
                            onClick={this.handleFlagMenuItemActivated}
                        />
                        <Menu.ItemAction
                            show={isMobile && !isSystemMessage && !this.props.isFlagged}
                            text={Utils.localizeMessage('rhs_root.mobile.flag', 'Flag')}
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
                    </Menu.Group>
                    <Menu.Group divider={this.renderDivider('edit')}>
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
                    </Menu.Group>
                    {pluginItems.length > 0 && this.renderDivider('plugins')}
                    {pluginItems}
                    <Pluggable
                        postId={this.props.post.id}
                        pluggableName='PostDropdownMenuItem'
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}
