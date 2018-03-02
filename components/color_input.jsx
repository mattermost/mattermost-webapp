// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import {ChromePicker} from 'react-color';

class ColorInput extends React.Component {
    static propTypes = {

        /*
         * Selected color
         */
        color: PropTypes.string.isRequired,

        /*
         * Function called when color changed. Takes hex format of color Ex: #ffeec0
         */
        onChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            idOpened: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const {isOpened: prevIsOpened} = prevState;
        const {isOpened} = this.state;

        if (isOpened !== prevIsOpened) {
            if (isOpened) {
                document.addEventListener('click', this.checkClick);
            } else {
                document.removeEventListener('click', this.checkClick);
            }
        }
    }

    checkClick = (e) => {
        const colorPickerDOMNode = ReactDom.findDOMNode(this.colorPicker);
        if (!colorPickerDOMNode || !colorPickerDOMNode.contains(e.target)) {
            this.setState({isOpened: false});
        }
    };

    togglePicker = () => {
        this.setState({isOpened: !this.state.isOpened});
    };

    handleChange = (newColorData) => {
        const {hex} = newColorData;
        const {onChange: handleChange} = this.props;

        if (handleChange) {
            handleChange(hex);
        }
    };

    getColorPicker = (node) => {
        this.colorPicker = node;
    };

    render() {
        const {color} = this.props;
        const {isOpened} = this.state;

        return (
            <div className='color-input input-group'>
                <input
                    className='form-control'
                    type='text'
                    value={color}
                    readOnly={true}
                />
                <span
                    className='input-group-addon'
                    onClick={this.togglePicker}
                >
                    <i
                        className='color-icon'
                        style={{
                            backgroundColor: color,
                        }}
                    />
                </span>
                {isOpened && (
                    <div
                        ref={this.getColorPicker}
                        className='color-popover'
                    >
                        <ChromePicker
                            color={color}
                            onChange={this.handleChange}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default ColorInput;
