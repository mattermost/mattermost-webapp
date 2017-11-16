// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

export default function SettingItemMin(props) {
    let editButton = null;
    let describeSection = null;
    if (!props.disableOpen && Utils.isMobile()) {
        editButton = (
            <li className='col-xs-12 col-sm-3 section-edit'>
                <button
                    id={Utils.createSafeId(props.title) + 'Edit'}
                    className='color--link cursor--pointer style--none'
                    onClick={props.updateSection}
                >
                    <i className='fa fa-pencil'/>
                    {props.describe}
                </button>
            </li>
        );
    } else if (!props.disableOpen) {
        editButton = (
            <li className='col-xs-12 col-sm-3 section-edit'>
                <button
                    id={Utils.createSafeId(props.title) + 'Edit'}
                    className='color--link cursor--pointer style--none text-left'
                    onClick={props.updateSection}
                >
                    <i className='fa fa-pencil'/>
                    <FormattedMessage
                        id='setting_item_min.edit'
                        defaultMessage='Edit'
                    />
                </button>
            </li>
        );

        describeSection = (
            <li
                id={Utils.createSafeId(props.title) + 'Desc'}
                className='col-xs-12 section-describe'
            >
                {props.describe}
            </li>
        );
    }

    return (
        <ul
            className='section-min'
            onClick={props.updateSection}
        >
            <li
                id={Utils.createSafeId(props.title) + 'Title'}
                className='col-xs-12 col-sm-9 section-title'
            >
                {props.title}
            </li>
            {editButton}
            {describeSection}
        </ul>
    );
}

SettingItemMin.propTypes = {
    title: PropTypes.node,
    disableOpen: PropTypes.bool,
    updateSection: PropTypes.func,
    describe: PropTypes.node
};
