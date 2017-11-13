// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default function DotMenuEdit(props) {
    let editId = null;
    if (props.idCount > -1) {
        editId = Utils.createSafeId(props.idPrefix + props.idCount);
    }

    if (props.idPrefix.indexOf(Constants.RHS_ROOT) === 0) {
        editId = props.idPrefix;
    }

    return (
        <li
            id={Utils.createSafeId(editId)}
            key={props.idPrefix}
            role='presentation'
        >
            <button
                className='style--none'
                onClick={() => props.actions.setEditingPost(
                    props.post.id,
                    props.commentsCount,
                    props.idPrefix.indexOf(Constants.CENTER) === 0 ? 'post_textbox' : 'reply_textbox',
                    props.idPrefix.indexOf(Constants.CENTER) === 0 ? props.type : Utils.localizeMessage('rhs_comment.comment', 'Comment')
                )}
            >
                <FormattedMessage
                    id='post_info.edit'
                    defaultMessage='Edit'
                />
            </button>
        </li>
    );
}

DotMenuEdit.propTypes = {
    idPrefix: PropTypes.string.isRequired,
    idCount: PropTypes.number,
    post: PropTypes.object,
    type: PropTypes.string,
    commentsCount: PropTypes.number,
    actions: PropTypes.shape({

        /*
         * Function set the editing post
         */
        setEditingPost: PropTypes.func.isRequired
    }).isRequired
};

DotMenuEdit.defaultProps = {
    idCount: -1
};
