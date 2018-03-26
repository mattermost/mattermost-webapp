// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {showGetPostLinkModal} from 'actions/global_actions.jsx';
import DeletePostModal from 'components/delete_post_modal';
import {Constants, ModalIdentifiers} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default function DotMenuItem(props) {
    function handlePermalink(e) {
        e.preventDefault();
        showGetPostLinkModal(props.post);
    }

    function handleUnpinPost(e) {
        e.preventDefault();
        props.actions.unpinPost(props.post.id);
    }

    function handlePinPost(e) {
        e.preventDefault();
        props.actions.pinPost(props.post.id);
    }

    function handleDeletePost(e) {
        e.preventDefault();

        const deletePostModalData = {
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: props.post,
                commentCount: props.commentCount,
                isRHS: props.isRHS,
            },
        };

        props.actions.openModal(deletePostModalData);
    }

    const attrib = {};
    attrib.idPrefix = props.idPrefix;
    attrib.class = '';

    switch (props.idPrefix.substring((props.idPrefix.indexOf('DotMenu') + 7))) {
    case 'Reply':
        attrib.class = 'link__reply theme';
        attrib.onClick = props.handleOnClick;
        attrib.formattedMessageId = 'post_info.reply';
        attrib.formattedDefaultMessage = 'Reply';
        break;
    case 'Permalink':
        attrib.onClick = handlePermalink;
        attrib.formattedMessageId = 'post_info.permalink';
        attrib.formattedDefaultMessage = 'Permalink';
        attrib.post = props.post;
        break;
    case 'Pin':
        attrib.onClick = props.post.is_pinned ? handleUnpinPost : handlePinPost;
        attrib.formattedMessageId = props.post.is_pinned ? 'post_info.unpin' : 'post_info.pin';
        attrib.formattedDefaultMessage = props.post.is_pinned ? 'Un-pin from channel' : 'Pin from channel';
        attrib.post = props.post;
        break;
    case 'Delete':
        attrib.onClick = handleDeletePost;
        attrib.formattedMessageId = 'post_info.del';
        attrib.formattedDefaultMessage = 'Delete';
        attrib.commentCount = props.commentCount;
        break;
    default:
    }

    let itemId = null;
    if (props.idCount > -1) {
        itemId = Utils.createSafeId(props.idPrefix + props.idCount);
    }

    if (attrib.idPrefix.indexOf(Constants.RHS_ROOT) === 0) {
        itemId = attrib.idPrefix;
    }

    return (
        <li
            id={Utils.createSafeId(itemId)}
            key={attrib.idPrefix}
            role='presentation'
        >
            <button
                className='style--none'
                role='menuitem'
                onClick={attrib.onClick}
            >
                <FormattedMessage
                    id={attrib.formattedMessageId}
                    defaultMessage={attrib.formattedDefaultMessage}
                />
            </button>
        </li>
    );
}

DotMenuItem.propTypes = {
    idPrefix: PropTypes.string.isRequired,
    idCount: PropTypes.number,
    isRHS: PropTypes.bool,
    post: PropTypes.object,
    handleOnClick: PropTypes.func,
    commentCount: PropTypes.number,

    actions: PropTypes.shape({

        /**
         * Function to pin the post
         */
        pinPost: PropTypes.func,

        /**
         * Function to unpin the post
         */
        unpinPost: PropTypes.func,

        /**
         * Function to open a modal
         */
        openModal: PropTypes.func,
    }),
};

DotMenuItem.defaultProps = {
    idPrefix: '',
    idCount: -1,
};
