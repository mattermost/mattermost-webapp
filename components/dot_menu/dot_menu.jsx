// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import Permissions from 'mattermost-redux/constants/permissions';

import {showGetPostLinkModal} from 'actions/global_actions.jsx';
import {ModalIdentifiers, UNSET_POST_EDIT_TIME_LIMIT} from 'utils/constants.jsx';
import DeletePostModal from 'components/delete_post_modal';
import DelayedAction from 'utils/delayed_action.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

import Pluggable from 'plugins/pluggable';

import DotMenuItem from './dot_menu_item.jsx';

class DotMenu extends Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        teamId: PropTypes.string,
        location: PropTypes.oneOf(['CENTER', 'RHS_ROOT', 'RHS_COMMENT', 'SEARCH']).isRequired,
        commentCount: PropTypes.number,
        isFlagged: PropTypes.bool,
        handleCommentClick: PropTypes.func,
        handleDropdownOpened: PropTypes.func,
        handleAddReactionClick: PropTypes.func,
        isReadOnly: PropTypes.bool,
        pluginMenuItems: PropTypes.arrayOf(PropTypes.object),
        isLicensed: PropTypes.bool.isRequired,
        postEditTimeLimit: PropTypes.string.isRequired,
        intl: intlShape.isRequired,
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
        }).isRequired,
    }

    static defaultProps = {
        post: {},
        commentCount: 0,
        isFlagged: false,
        isReadOnly: false,
        enableEmojiPicker: false,
        pluginMenuItems: [],
    }

    constructor(props) {
        super(props);

        this.editDisableAction = new DelayedAction(this.handleEditDisable);

        this.state = {
            openUp: false,
        };
        this.dotMenuId = props.location + '_dropdown_' + props.post.id;
    }

    disableCanEditPostByTime() {
        const {post, isLicensed, postEditTimeLimit} = this.props;
        const canEdit = PostUtils.canEditPost(post);

        if (canEdit && isLicensed) {
            if (String(postEditTimeLimit) !== String(UNSET_POST_EDIT_TIME_LIMIT)) {
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
        $('#' + this.dotMenuId).on('shown.bs.dropdown', this.handleDropdownOpened);
        $('#' + this.dotMenuId).on('hidden.bs.dropdown', () => this.props.handleDropdownOpened(false));
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

    handleDropdownOpened = () => {
        this.props.handleDropdownOpened(true);

        let position = 0;
        if (this.refs.dropdownToggle) {
            position = $('#post-list').height() - $(this.refs.dropdownToggle).offset().top;
        }

        if (this.refs.dropdown) {
            const dropdown = $(this.refs.dropdown);

            if (position < dropdown.height()) {
                dropdown.addClass('bottom');
            }
        }
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

    handleDeleteMenuItemActivated = (e) => {
        e.preventDefault();

        const deletePostModalData = {
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: this.props.post,
                commentCount: this.props.commentCount,
                isRHS: this.props.location === 'RHS_ROOT' || this.props.location === 'RHS_COMMENT',
            },
        };

        this.props.actions.openModal(deletePostModalData);
    }

    handleEditMenuItemActivated = () => {
        const {formatMessage} = this.props.intl;

        this.props.actions.setEditingPost(
            this.props.post.id,
            this.props.commentCount,
            this.props.location === 'CENTER' ? 'post_textbox' : 'reply_textbox',
            this.props.post.root_id ? formatMessage({id: 'rhs_comment.comment', defaultMessage: 'Comment'}) : formatMessage({id: 'create_post.post', defaultMessage: 'Post'}),
            this.props.location === 'RHS_ROOT' || this.props.location === 'RHS_COMMENT',
        );
    }

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();

        const menuItems = [];
        if (isMobile && !isSystemMessage) {
            // add menu item to support adding reactions to posts
            if (!this.props.isReadOnly && this.props.enableEmojiPicker) {
                menuItems.push(
                    <ChannelPermissionGate
                        key={'add_reaction'}
                        channelId={this.props.post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <DotMenuItem
                            menuItemText={
                                <FormattedMessage
                                    id={'rhs_root.mobile.add_reaction'}
                                    defaultMessage={'Add Reaction'}
                                />
                            }
                            handleMenuItemActivated={this.handleAddReactionMenuItemActivated}
                        />
                    </ChannelPermissionGate>
                );
            }
            let text = (
                <FormattedMessage
                    id={'rhs_root.mobile.flag'}
                    defaultMessage={'Flag'}
                />
            );
            if (this.props.isFlagged) {
                text = (
                    <FormattedMessage
                        id={'rhs_root.mobile.unflag'}
                        defaultMessage={'Unflag'}
                    />
                );
            }
            menuItems.push(
                <DotMenuItem
                    key={'flag'}
                    menuItemText={text}
                    handleMenuItemActivated={this.handleFlagMenuItemActivated}
                />
            );
        }

        if (!isSystemMessage) {
            if (this.props.location === 'CENTER') {
                menuItems.push(
                    <DotMenuItem
                        key={'reply'}
                        menuItemText={
                            <FormattedMessage
                                id={'post_info.reply'}
                                defaultMessage={'Reply'}
                            />
                        }
                        handleMenuItemActivated={this.props.handleCommentClick}
                    />
                );
            }

            menuItems.push(
                <DotMenuItem
                    key={'permalink'}
                    menuItemText={
                        <FormattedMessage
                            id={'post_info.permalink'}
                            defaultMessage={'Permalink'}
                        />
                    }
                    handleMenuItemActivated={this.handlePermalinkMenuItemActivated}
                />
            );
            if (!this.props.isReadOnly) {
                menuItems.push(
                    <DotMenuItem
                        key={'pin'}
                        menuItemText={
                            <FormattedMessage
                                id={this.props.post.is_pinned ? t('post_info.unpin') : t('post_info.pin')}
                                defaultMessage={'Pin'}
                            />
                        }
                        handleMenuItemActivated={this.handlePinMenuItemActivated}
                    />
                );
            }
        }

        if (this.state.canDelete) {
            menuItems.push(
                <DotMenuItem
                    key={'delete'}
                    menuItemText={
                        <FormattedMessage
                            id={'post_info.del'}
                            defaultMessage={'Delete'}
                        />
                    }
                    handleMenuItemActivated={this.handleDeleteMenuItemActivated}
                />
            );
        }

        if (this.state.canEdit) {
            menuItems.push(
                <DotMenuItem
                    key={'edit'}
                    menuItemText={
                        <FormattedMessage
                            id={'post_info.edit'}
                            defaultMessage={'Edit'}
                        />
                    }
                    handleMenuItemActivated={this.handleEditMenuItemActivated}
                />
            );
        }

        const pluginItems = this.props.pluginMenuItems.
            filter((item) => {
                return item.filter ? item.filter(this.props.post.id) : item;
            }).
            map((item) => {
                return (
                    <DotMenuItem
                        key={item.id + '_pluginmenuitem'}
                        menuItemText={item.text}
                        handleMenuItemActivated={() => {
                            if (item.action) {
                                item.action(this.props.post.id);
                            }
                        }}
                    />
                );
            });

        if (menuItems.length === 0 && pluginItems.length === 0) {
            return null;
        }

        const tooltip = (
            <Tooltip
                id='dotmenu-icon-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id='post_info.dot_menu.tooltip.more_actions'
                    defaultMessage='More Actions'
                />
            </Tooltip>
        );

        return (
            <div
                className='dropdown'
                ref='dotMenu'
            >
                <div id={this.dotMenuId}>
                    <OverlayTrigger
                        className='hidden-xs'
                        delayShow={500}
                        placement='top'
                        overlay={tooltip}
                        rootClose={true}
                    >
                        <button
                            ref='dropdownToggle'
                            className='dropdown-toggle post__dropdown color--link style--none'
                            type='button'
                            data-toggle='dropdown'
                            aria-expanded='false'
                        />
                    </OverlayTrigger>
                    <div className='dropdown-menu__content'>
                        <ul
                            ref='dropdown'
                            className='dropdown-menu'
                            role='menu'
                        >
                            {menuItems}
                            {pluginItems}
                            <Pluggable
                                postId={this.props.post.id}
                                pluggableName='PostDropdownMenuItem'
                            />
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(DotMenu);
