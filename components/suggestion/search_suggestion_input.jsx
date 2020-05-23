// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import QuickInput from 'components/quick_input.jsx';
import * as Utils from 'utils/utils.jsx';

export default class SearchSuggestionInput extends React.PureComponent {
    static propTypes = QuickInput.propTypes;
    inputRef = React.createRef();

    recalculateSize = () => {
        // only for textarea, nothing to do here.
    }

    getPretext = () => {
        const input = this.getInput();

        return input.value.substring(0, input.selectionEnd);
    }

    focus = () => {
        const input = this.getInput();
        if (input.value === '""' || input.value.endsWith('""')) {
            input.selectionStart = input.value.length - 1;
            input.selectionEnd = input.value.length - 1;
        } else {
            input.selectionStart = input.value.length;
        }
        input.focus();
    }

    blur = () => {
        this.getInput().blur();
    }

    getClientHeight = () => {
        return this.getInput().clientHeight;
    }

    getValue = () => {
        return this.getInput().value;
    }

    getSelectionEnd = () => {
        return this.getInput().selectionEnd;
    }

    handleChange = (e) => {
        this.props.onInput(e.target.value);
    }

    setCaretPosition = (position) => {
        Utils.setCaretPosition(this.getInput(), position);
    }

    getInput = () => {
        return this.inputRef.current.input || this.inputRef.current;
    }

    render() {
        return (
            <QuickInput
                ref={this.inputRef}
                {...this.props}
                onInput={this.handleChange}
            />
        );
    }
}

