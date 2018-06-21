// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isMobile, localizeMessage} from 'utils/utils.jsx';

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

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
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

        if (!this.props.disableOpen && isMobile()) {
            editButton = (
                <li className='col-xs-12 col-sm-3 section-edit'>
                    <button
                        id={this.props.section + 'Edit'}
                        className='color--link cursor--pointer style--none'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                    >
                        <i
                            className='fa fa-pencil'
                            title={localizeMessage('generic_icons.edit', 'Edit Icon')}
                        />
                        {this.props.describe}
                    </button>
                </li>
            );
        } else if (!this.props.disableOpen) {
            editButton = (
                <li className='col-xs-12 col-sm-3 section-edit'>
                    <button
                        id={this.props.section + 'Edit'}
                        className='color--link cursor--pointer style--none text-left'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                    >
                        <i
                            className='fa fa-pencil'
                            title={localizeMessage('generic_icons.edit', 'Edit Icon')}
                        />
                        <FormattedMessage
                            id='setting_item_min.edit'
                            defaultMessage='Edit'
                        />
                    </button>
                </li>
            );

            describeSection = (
                <li
                    id={this.props.section + 'Desc'}
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
                    id={this.props.section + 'Title'}
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
