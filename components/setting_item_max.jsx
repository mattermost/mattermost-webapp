// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import SaveButton from 'components/save_button.jsx';
import Constants from 'utils/constants.jsx';
import {isKeyPressed} from 'utils/utils.jsx';

export default class SettingItemMax extends React.PureComponent {
    static defaultProps = {
        infoPosition: 'bottom',
        saving: false,
        section: '',
        containerStyle: '',
    };

    static propTypes = {

        /**
         * Array of inputs selection
         */
        inputs: PropTypes.array,

        /**
         * Styles for main component
         */
        containerStyle: PropTypes.string,

        /**
         * Client error
         */
        clientError: PropTypes.string,

        /**
         * Server error
         */
        serverError: PropTypes.string,

        /**
         * Settings extra information
         */
        extraInfo: PropTypes.element,

        /**
         * Info position
         */
        infoPosition: PropTypes.string,

        /**
         * Settings or tab section
         */
        section: PropTypes.string,

        /**
         * Function to update section
         */
        updateSection: PropTypes.func,

        /**
         * setting to submit
         */
        setting: PropTypes.string,

        /**
         * Function to submit setting
         */
        submit: PropTypes.func,

        /**
         * Extra information on submit
         */
        submitExtra: PropTypes.node,

        /**
         * Indicates whether setting is on saving
         */
        saving: PropTypes.bool,

        /**
         * Settings title
         */
        title: PropTypes.node,

        /**
         * Settings width
         */
        width: PropTypes.string,

        /**
         * Text of cancel button
         */
        cancelButtonText: PropTypes.node,
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER) && this.props.submit) {
            this.handleSubmit(e);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        if (this.props.setting) {
            this.props.submit(this.props.setting);
        } else {
            this.props.submit();
        }
    }

    handleUpdateSection = (e) => {
        this.props.updateSection(this.props.section);
        e.preventDefault();
    }

    render() {
        let clientError = null;
        if (this.props.clientError) {
            clientError = (
                <div className='form-group'>
                    <label
                        id='clientError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.clientError}
                    </label>
                </div>
            );
        }

        let serverError = null;
        if (this.props.serverError) {
            serverError = (
                <div className='form-group'>
                    <label
                        id='serverError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.serverError}
                    </label>
                </div>
            );
        }

        let extraInfo = null;
        let hintClass = 'setting-list__hint';
        if (this.props.infoPosition === 'top') {
            hintClass = 'padding-bottom x2';
        }

        if (this.props.extraInfo) {
            extraInfo = (<div className={hintClass}>{this.props.extraInfo}</div>);
        }

        let submit = '';
        if (this.props.submit) {
            submit = (
                <SaveButton
                    saving={this.props.saving}
                    disabled={this.props.saving}
                    onClick={this.handleSubmit}
                />
            );
        }

        const inputs = this.props.inputs;
        let widthClass;
        if (this.props.width === 'full') {
            widthClass = 'col-sm-12';
        } else if (this.props.width === 'medium') {
            widthClass = 'col-sm-10 col-sm-offset-2';
        } else {
            widthClass = 'col-sm-9 col-sm-offset-3';
        }

        let title;
        if (this.props.title) {
            title = <li className='col-sm-12 section-title'>{this.props.title}</li>;
        }

        let listContent = (
            <li className='setting-list-item'>
                {inputs}
                {extraInfo}
            </li>
        );

        if (this.props.infoPosition === 'top') {
            listContent = (
                <li>
                    {extraInfo}
                    {inputs}
                </li>
            );
        }

        let cancelButtonText;
        if (this.props.cancelButtonText) {
            cancelButtonText = this.props.cancelButtonText;
        } else {
            cancelButtonText = (
                <FormattedMessage
                    id='setting_item_max.cancel'
                    defaultMessage='Cancel'
                />
            );
        }

        return (
            <ul
                className={`section-max form-horizontal ${this.props.containerStyle}`}
            >
                {title}
                <li className={widthClass}>
                    <ul className='setting-list'>
                        {listContent}
                        <li className='setting-list-item'>
                            <hr/>
                            {this.props.submitExtra}
                            {serverError}
                            {clientError}
                            {submit}
                            <button
                                id={'cancelSetting'}
                                className='btn btn-sm cursor--pointer style--none'
                                onClick={this.handleUpdateSection}
                            >
                                {cancelButtonText}
                            </button>
                        </li>
                    </ul>
                </li>
            </ul>
        );
    }
}
