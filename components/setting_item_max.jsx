// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import SaveButton from 'components/save_button.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default class SettingItemMax extends React.Component {
    constructor(props) {
        super(props);

        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onKeyDown(e) {
        if (e.keyCode === Constants.KeyCodes.ENTER && this.props.submit) {
            this.props.submit(e);
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    render() {
        var clientError = null;
        if (this.props.client_error) {
            clientError = (
                <div className='form-group'>
                    <label
                        id='clientError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.client_error}
                    </label>
                </div>
            );
        }

        var serverError = null;
        if (this.props.server_error) {
            serverError = (
                <div className='form-group'>
                    <label
                        id='serverError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.server_error}
                    </label>
                </div>
            );
        }

        var extraInfo = null;
        let hintClass = 'setting-list__hint';
        if (this.props.infoPosition === 'top') {
            hintClass = 'padding-bottom x2';
        }

        if (this.props.extraInfo) {
            extraInfo = (<div className={hintClass}>{this.props.extraInfo}</div>);
        }

        var submit = '';
        if (this.props.submit) {
            submit = (
                <SaveButton
                    saving={this.props.saving}
                    disabled={this.props.saving}
                    onClick={this.props.submit}
                />
            );
        }

        var inputs = this.props.inputs;
        var widthClass;
        if (this.props.width === 'full') {
            widthClass = 'col-sm-12';
        } else if (this.props.width === 'medium') {
            widthClass = 'col-sm-10 col-sm-offset-2';
        } else {
            widthClass = 'col-sm-9 col-sm-offset-3';
        }

        let title;
        let titleProp = 'unknownTitle';
        if (this.props.title) {
            title = <li className='col-sm-12 section-title'>{this.props.title}</li>;
            titleProp = this.props.title;
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
            <ul className='section-max form-horizontal'>
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
                            <a
                                id={Utils.createSafeId(titleProp) + 'Cancel'}
                                className='btn btn-sm'
                                href='#'
                                onClick={this.props.updateSection}
                            >
                                {cancelButtonText}
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        );
    }
}

SettingItemMax.propTypes = {
    inputs: PropTypes.array,
    client_error: PropTypes.string,
    server_error: PropTypes.string,
    extraInfo: PropTypes.element,
    infoPosition: PropTypes.string,
    updateSection: PropTypes.func,
    submit: PropTypes.func,
    saving: PropTypes.bool,
    title: PropTypes.node,
    width: PropTypes.string,
    submitExtra: PropTypes.node,
    cancelButtonText: PropTypes.node
};

SettingItemMax.defaultProps = {
    infoPosition: 'bottom',
    saving: false
};
