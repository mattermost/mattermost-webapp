// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

import DotMenuEdit from './dot_menu_edit.jsx';
import DotMenuFlag from './dot_menu_flag.jsx';
import DotMenuItem from './dot_menu_item.jsx';

export default class DotMenu extends Component {
    static propTypes = {
        idPrefix: PropTypes.string.isRequired,
        idCount: PropTypes.number,
        post: PropTypes.object.isRequired,
        commentCount: PropTypes.number,
        isFlagged: PropTypes.bool,
        isRHS: PropTypes.bool,
        handleCommentClick: PropTypes.func,
        handleDropdownOpened: PropTypes.func,

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
        idCount: -1,
        post: {},
        commentCount: 0,
        isFlagged: false,
        isRHS: false,
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
        $('#' + this.props.idPrefix + '_dropdown' + this.props.post.id).on('shown.bs.dropdown', this.handleDropdownOpened);
        $('#' + this.props.idPrefix + '_dropdown' + this.props.post.id).on('hidden.bs.dropdown', () => this.props.handleDropdownOpened(false));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.post !== this.props.post) {
            this.setState({
                canDelete: PostUtils.canDeletePost(nextProps.post),
                canEdit: PostUtils.canEditPost(nextProps.post, this.editDisableAction),
            });
        }
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

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();

        if (this.props.idPrefix === Constants.CENTER && (!isMobile && isSystemMessage && !this.state.canDelete && !this.state.canEdit)) {
            return null;
        }

        if (this.props.idPrefix === Constants.RHS && (this.props.post.state === Constants.POST_FAILED || this.props.post.state === Constants.POST_LOADING)) {
            return null;
        }

        let type = 'Post';
        if (this.props.post.root_id && this.props.post.root_id.length > 0) {
            type = 'Comment';
        }

        const idPrefix = this.props.idPrefix + 'DotMenu';

        let dotMenuFlag = null;
        if (isMobile && !isSystemMessage) {
            dotMenuFlag = (
                <DotMenuFlag
                    idPrefix={idPrefix + 'Flag'}
                    idCount={this.props.idCount}
                    postId={this.props.post.id}
                    isFlagged={this.props.isFlagged}
                    actions={{
                        flagPost: this.props.actions.flagPost,
                        unflagPost: this.props.actions.unflagPost,
                    }}
                />
            );
        }

        let dotMenuReply = null;
        let dotMenuPermalink = null;
        let dotMenuPin = null;
        if (!isSystemMessage) {
            if (this.props.idPrefix === Constants.CENTER) {
                dotMenuReply = (
                    <DotMenuItem
                        idPrefix={idPrefix + 'Reply'}
                        idCount={this.props.idCount}
                        handleOnClick={this.props.handleCommentClick}
                    />
                );
            }

            dotMenuPermalink = (
                <DotMenuItem
                    idPrefix={idPrefix + 'Permalink'}
                    idCount={this.props.idCount}
                    post={this.props.post}
                />
            );

            dotMenuPin = (
                <DotMenuItem
                    idPrefix={idPrefix + 'Pin'}
                    idCount={this.props.idCount}
                    post={this.props.post}
                    actions={{
                        pinPost: this.props.actions.pinPost,
                        unpinPost: this.props.actions.unpinPost,
                    }}
                />
            );
        }

        let dotMenuDelete = null;
        if (this.state.canDelete) {
            dotMenuDelete = (
                <DotMenuItem
                    idPrefix={idPrefix + 'Delete'}
                    isRHS={this.props.isRHS}
                    idCount={this.props.idCount}
                    post={this.props.post}
                    commentCount={type === 'Post' ? this.props.commentCount : 0}
                    actions={{
                        openModal: this.props.actions.openModal,
                    }}
                />
            );
        }

        let dotMenuEdit = null;
        if (this.state.canEdit) {
            dotMenuEdit = (
                <DotMenuEdit
                    idPrefix={idPrefix + 'Edit'}
                    isRHS={this.props.isRHS}
                    idCount={this.props.idCount}
                    post={this.props.post}
                    type={type}
                    commentCount={type === 'Post' ? this.props.commentCount : 0}
                    actions={{
                        setEditingPost: this.props.actions.setEditingPost,
                    }}
                />
            );
        }

        let dotMenuId = null;
        if (this.props.idCount > -1) {
            dotMenuId = Utils.createSafeId(idPrefix + this.props.idCount);
        }

        if (this.props.idPrefix === Constants.RHS_ROOT) {
            dotMenuId = idPrefix;
        }

        return (
            <div
                id={dotMenuId}
                className='dropdown'
                ref='dotMenu'
            >
                <div
                    id={this.props.idPrefix + '_dropdown' + this.props.post.id}
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
                            {dotMenuReply}
                            {dotMenuFlag}
                            {dotMenuPermalink}
                            {dotMenuPin}
                            {dotMenuDelete}
                            {dotMenuEdit}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
