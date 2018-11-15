// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';

export default class AutocompleteSelector extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        providers: PropTypes.array.isRequired,
        onChange: PropTypes.func,
        onSelected: PropTypes.func,
        label: PropTypes.node,
        labelClassName: PropTypes.string,
        inputClassName: PropTypes.string,
        helpText: PropTypes.node,
        placeholder: PropTypes.string,
        footer: PropTypes.node,
        afterSelectorNode: PropTypes.node,
        value: PropTypes.string,

        // Object with value and text fields
        selected: PropTypes.object,
    };

    static defaultProps = {
        id: '',
        labelClassName: '',
        inputClassName: '',
    };

    constructor(props) {
        super(props);

        this.state = {
            selected: null,
            input: '',
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.selected && props.selected !== state.selected) {
            return {
                input: props.selected.text,
                selected: props.selected,
            };
        }

        return null;
    }

    onChange = (e) => {
        const value = e.target.value;
        this.setState({input: value, previousInput: ''});

        if (this.props.onChange) {
            this.props.onChange(this.props.id, value);
        }
    };

    handleSelected = (selected) => {
        this.setState({selected});

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
        this.setState({input: '', previousInput: this.state.input});
    }

    onBlur = () => {
        if (this.state.previousInput) {
            this.setState({input: this.state.previousInput, previousInput: ''});
        }
    }

    render() {
        const {
            providers,
            placeholder,
            footer,
            value,
            label,
            labelClassName,
            helpText,
            inputClassName,
            afterSelectorNode,
        } = this.props;

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
            <div className='form-group'>
                {labelContent}
                <div className={inputClassName}>
                    <SuggestionBox
                        placeholder={placeholder}
                        ref={this.setSuggestionRef}
                        listComponent={SuggestionList}
                        className='form-control'
                        containerClass='select-suggestion-container'
                        value={value || this.state.input}
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
                    {afterSelectorNode}
                    {helpTextContent}
                    {footer}
                </div>
            </div>
        );
    }
}