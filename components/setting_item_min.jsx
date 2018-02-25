// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

export default class SettingItemMin extends React.PureComponent {
    static defaultProps = {
        section: '',
        focused: false,
    };

    static propTypes = {

        /**
         * Settings title
         */
        title: PropTypes.node,

        /**
         * Option to disable opening the setting
         */
        disableOpen: PropTypes.bool,

        /**
         * Indicates whether the focus should be on the "Edit" button
         */
        focused: PropTypes.bool,

        /**
         * Settings or tab section
         */
        section: PropTypes.string,

        /**
         * Function to update section
         */
        updateSection: PropTypes.func,

        /**
         * Settings description
         */
        describe: PropTypes.node,
    };

    componentDidMount() {
        if (this.props.focused && this.edit) {
            this.edit.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.focused && this.edit) {
            this.edit.focus();
        }
    }

    getEdit = (node) => {
        this.edit = node;
    }

    handleUpdateSection = (e) => {
        e.preventDefault();
        this.props.updateSection(this.props.section);
    }

    render() {
        let editButton = null;
        let describeSection = null;

        if (!this.props.disableOpen && Utils.isMobile()) {
            editButton = (
                <li className='col-xs-12 col-sm-3 section-edit'>
                    <button
                        id={Utils.createSafeId(this.props.title) + 'Edit'}
                        className='color--link cursor--pointer style--none'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                    >
                        <i className='fa fa-pencil'/>
                        {this.props.describe}
                    </button>
                </li>
            );
        } else if (!this.props.disableOpen) {
            editButton = (
                <li className='col-xs-12 col-sm-3 section-edit'>
                    <button
                        id={Utils.createSafeId(this.props.title) + 'Edit'}
                        className='color--link cursor--pointer style--none text-left'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
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
                    id={Utils.createSafeId(this.props.title) + 'Desc'}
                    className='col-xs-12 section-describe'
                >
                    {this.props.describe}
                </li>
            );
        }

        return (
            <ul
                className='section-min'
                onClick={this.handleUpdateSection}
            >
                <li
                    id={Utils.createSafeId(this.props.title) + 'Title'}
                    className='col-xs-12 col-sm-9 section-title'
                >
                    {this.props.title}
                </li>
                {editButton}
                {describeSection}
            </ul>
        );
    }
}
