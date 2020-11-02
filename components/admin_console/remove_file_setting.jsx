// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import Setting from './setting';

export default class RemoveFileSetting extends Setting {
    static get propTypes() {
        return {
            id: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            helpText: PropTypes.node,
            removeButtonText: PropTypes.node.isRequired,
            removingText: PropTypes.node,
            fileName: PropTypes.string.isRequired,
            onSubmit: PropTypes.func.isRequired,
            disabled: PropTypes.bool,
        };
    }

    handleRemove = (e) => {
        e.preventDefault();

        $(this.refs.remove_button).button('loading');
        this.props.onSubmit(this.props.id, () => {
            $(this.refs.remove_button).button('reset');
        });
    }

    render() {
        return (
            <Setting
                label={this.props.label}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                <div>
                    <div className='help-text remove-filename'>
                        {this.props.fileName}
                    </div>
                    <button
                        type='button'
                        className='btn btn-danger'
                        onClick={this.handleRemove}
                        ref='remove_button'
                        disabled={this.props.disabled}
                        data-loading-text={`<span class='glyphicon glyphicon-refresh glyphicon-refresh-animate'></span> ${this.props.removingText}`}
                    >
                        {this.props.removeButtonText}
                    </button>
                </div>
            </Setting>
        );
    }
}
/* eslint-enable react/no-string-refs */
