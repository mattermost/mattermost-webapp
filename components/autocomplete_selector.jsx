// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

export default class AutocompleteSelector extends React.PureComponent {
    static propTypes = {
        providers: PropTypes.array.isRequired,
        value: PropTypes.string.isRequired,
        onSelected: PropTypes.func,
        label: PropTypes.node,
        labelClassName: PropTypes.string,
        inputClassName: PropTypes.string,
        helpText: PropTypes.node,
        placeholder: PropTypes.string,
        footer: PropTypes.node,
    };

    static defaultProps = {
        value: '',
        id: '',
        labelClassName: '',
        inputClassName: '',
    };

    constructor(props) {
        super(props);

        this.state = {
            input: '',
        };
    }

    onChange = (e) => {
        if (!e || !e.target) {
            return;
        }

        this.setState({input: e.target.value});
    }

    handleSelected = (selected) => {
        this.setState({input: ''});

        if (this.props.onSelected) {
            this.props.onSelected(selected);
        }

        requestAnimationFrame(() => {
            if (this.suggestionRef) {
                this.suggestionRef.blur();
            }
        });
    }

    setSuggestionRef = (ref) => {
        this.suggestionRef = ref;
    }

    onFocus = () => {
        this.setState({focused: true});
    }

    onBlur = () => {
        this.setState({focused: false});
    }

    render() {
        const {
            providers,
            placeholder,
            footer,
            label,
            labelClassName,
            helpText,
            inputClassName,
            value,
        } = this.props;

        const {focused} = this.state;
        let {input} = this.state;

        if (!focused) {
            input = value;
        }

        let labelContent;
        if (label) {
            labelContent = (
                <label
                    className={'control-label ' + labelClassName}
                >
                    {label}
                </label>
            );
        }

        let helpTextContent;
        if (helpText) {
            helpTextContent = (
                <div className='help-text'>
                    {helpText}
                </div>
            );
        }

        return (
            <div
                data-testid='autoCompleteSelector'
                className='form-group'
            >
                {labelContent}
                <div className={inputClassName}>
                    <SuggestionBox
                        placeholder={placeholder}
                        ref={this.setSuggestionRef}
                        listComponent={SuggestionList}
                        className='form-control'
                        containerClass='select-suggestion-container'
                        value={input}
                        onChange={this.onChange}
                        onItemSelected={this.handleSelected}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        providers={providers}
                        completeOnTab={true}
                        renderDividers={false}
                        renderNoResults={true}
                        openOnFocus={true}
                        openWhenEmpty={true}
                        replaceAllInputOnSelect={true}
                    />
                    {helpTextContent}
                    {footer}
                </div>
            </div>
        );
    }
}
