// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import ColorInput from 'components/color_input';

class ColorChooser extends React.Component {
    static propTypes = {

        /*
         * The id of setting that we will change
         */
        id: PropTypes.string.isRequired,

        /*
         * The label of setting that we will choose
         */
        label: PropTypes.node.isRequired,

        /*
         * Selected color
         */
        color: PropTypes.string.isRequired,

        /*
         * Function called when color changed takes 2 arguments: Id of changing setting and new color
         */
        onChange: PropTypes.func,
    }

    handleChange = (newColor) => {
        const {id, onChange: handleChange} = this.props;
        if (handleChange) {
            handleChange(id, newColor);
        }
    }

    render() {
        const {label, color, id} = this.props;
        return (
            <div>
                <label className='custom-label'>{label}</label>
                <ColorInput
                    id={id}
                    color={color}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

export default ColorChooser;
