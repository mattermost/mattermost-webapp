// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {ChromePicker} from 'react-color';

import Setting from './setting.jsx';

export default class ColorSetting extends React.PureComponent {
    static propTypes = {

        /*
         * The unique identifer for the admin console setting
         */
        id: PropTypes.string.isRequired,

        /*
         * The text/jsx display name for the setting
         */
        label: PropTypes.node.isRequired,

        /*
         * The text/jsx help text to display underneath the setting
         */
        helpText: PropTypes.node,

        /*
         * The hex color value
         */
        value: PropTypes.string.isRequired,

        /*
         * Function called when the input changes
         */
        onChange: PropTypes.func,

        /*
         * Set to disable the setting
         */
        disabled: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            showPicker: false,
        };
    }

    componentDidMount() {
        document.addEventListener('click', this.closePicker);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.closePicker);
    }

    handleChange = (color) => {
        this.props.onChange(this.props.id, color.hex);
    }

    togglePicker = () => {
        if (this.props.disabled) {
            this.setState({showPicker: false});
        } else {
            this.setState({showPicker: !this.state.showPicker});
        }
    }

    closePicker = (e) => {
        if (!e.target.closest('.' + this.getPickerClass())) {
            this.setState({showPicker: false});
        }
    }

    onTextInput = (e) => {
        this.props.onChange(this.props.id, e.target.value);
    }

    getPickerClass = () => {
        return this.props.id ? 'picker-' + this.props.id.replace('.', '-') : '';
    }

    render() {
        let picker;
        if (this.state.showPicker) {
            picker = (
                <div className={'color-picker__popover ' + this.getPickerClass()}>
                    <ChromePicker
                        color={this.props.value}
                        onChange={this.handleChange}
                    />
                </div>
            );
        }

        return (
            <Setting
                label={this.props.label}
                helpText={this.props.helpText}
                inputId={this.props.id}
            >
                <div className='input-group color-picker colorpicker-element'>
                    <input
                        type='text'
                        className='form-control'
                        value={this.props.value}
                        onChange={this.onTextInput}
                        disabled={this.props.disabled}
                    />
                    <span
                        className={'input-group-addon ' + this.getPickerClass()}
                        onClick={this.togglePicker}
                    >
                        <i style={{backgroundColor: this.props.value}}/>
                    </span>
                    {picker}
                </div>
            </Setting>
        );
    }
}
