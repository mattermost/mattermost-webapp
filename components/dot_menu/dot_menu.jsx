// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';

import {showGetPostLinkModal} from 'actions/global_actions.jsx';

import {ModalIdentifiers} from 'utils/constants.jsx';
import DeletePostModal from 'components/delete_post_modal';
import DelayedAction from 'utils/delayed_action.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import DotMenuItem from './dot_menu_item.jsx';

export default class DotMenu extends Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        location: PropTypes.oneOf(['CENTER', 'RHS_ROOT', 'RHS_COMMENT', 'SEARCH']).isRequired,
        commentCount: PropTypes.number,
        isFlagged: PropTypes.bool,
        handleCommentClick: PropTypes.func,
        handleDropdownOpened: PropTypes.func,
        isReadOnly: PropTypes.bool,

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
    }

    constructor(props) {
        super(props);

        this.editDisableAction = new DelayedAction(this.handleEditDisable);

        this.state = {
            canDelete: PostUtils.canDeletePost(props.post),
            canEdit: PostUtils.canEditPost(props.post, this.editDisableAction),
        };
    }

    componentDidMount() {
        $('#dropdown_' + this.props.post.id).on('shown.bs.dropdown', this.handleDropdownOpened);
        $('#dropdown_' + this.props.post.id).on('hidden.bs.dropdown', () => this.props.handleDropdownOpened(false));
    }

    componentWillUnmount() {
        this.editDisableAction.cancel();
    }

    handleDropdownOpened = () => {
        this.props.handleDropdownOpened(true);

        const position = $('#post-list').height() - $(this.refs.dropdownToggle).offset().top;
        const dropdown = $(this.refs.dropdown);

        if (position < dropdown.height()) {
            dropdown.addClass('bottom');
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
        this.props.actions.setEditingPost(
            this.props.post.id,
            this.props.commentCount,
            this.props.location === 'CENTER' ? 'post_textbox' : 'reply_textbox',
            this.props.post.root_id ? Utils.localizeMessage('rhs_comment.comment', 'Comment') : Utils.localizeMessage('create_post.post', 'Post'),
            this.props.location === 'RHS_ROOT' || this.props.location === 'RHS_COMMENT',
        );
    }

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();
        const canDelete = PostUtils.canDeletePost(this.props.post);
        const canEdit = PostUtils.canEditPost(this.props.post, this.editDisableAction); // Fix this crazy

        const menuItems = [];

        if (isMobile && !isSystemMessage) {
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
                                id={this.props.post.is_pinned ? 'post_info.unpin' : 'post_info.pin'}
                                defaultMessage={'Pin'}
                            />
                        }
                        handleMenuItemActivated={this.handlePinMenuItemActivated}
                    />
                );
            }
        }

        if (canDelete) {
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

        if (canEdit) {
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

        if (menuItems.length === 0) {
            return null;
        }

        return (
            <div
                className='dropdown'
                ref='dotMenu'
            >
                <div
                    id={'dropdown_' + this.props.post.id}
                >
                    <button
                        ref='dropdownToggle'
                        className='dropdown-toggle post__dropdown color--link style--none'
                        type='button'
                        data-toggle='dropdown'
                        aria-expanded='false'
                    />
                    <div className='dropdown-menu__content'>
                        <ul
                            ref='dropdown'
                            className='dropdown-menu'
                            role='menu'
                        >
                            {menuItems}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
