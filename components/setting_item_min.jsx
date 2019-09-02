// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {isMobile} from 'utils/utils.jsx';
import EditIcon from 'components/widgets/icons/fa_edit_icon';

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
                <div className='section-min__edit'>
                    <button
                        id={this.props.section + 'Edit'}
                        className='color--link cursor--pointer style--none'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                        aria-labelledby={this.props.section + 'Title ' + this.props.section + 'Edit'}
                    >
                        <EditIcon/>
                        {this.props.describe}
                    </button>
                </div>
            );
        } else if (!this.props.disableOpen) {
            editButton = (
                <div className='section-min__edit'>
                    <button
                        id={this.props.section + 'Edit'}
                        className='color--link cursor--pointer style--none text-left'
                        onClick={this.handleUpdateSection}
                        ref={this.getEdit}
                        aria-labelledby={this.props.section + 'Title ' + this.props.section + 'Edit'}
                    >
                        <EditIcon/>
                        <FormattedMessage
                            id='setting_item_min.edit'
                            defaultMessage='Edit'
                        />
                    </button>
                </div>
            );

            describeSection = (
                <div
                    id={this.props.section + 'Desc'}
                    className='section-min__describe'
                >
                    {this.props.describe}
                </div>
            );
        }

        return (
            <div
                className='section-min'
                onClick={this.handleUpdateSection}
            >
                <div className='d-flex'>
                    <div
                        id={this.props.section + 'Title'}
                        className='section-min__title'
                    >
                        {this.props.title}
                    </div>
                    {editButton}
                </div>
                {describeSection}
            </div>
        );
    }
}
