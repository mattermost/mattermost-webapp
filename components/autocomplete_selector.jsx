// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list.jsx';

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
        disabled: PropTypes.bool,
        toggleFocus: PropTypes.func,
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
            modalBounds: {top: 0, bottom: 0},
        };

        this.dropDirection = 'bottom';
        this.container = React.createRef();
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

    componentWillUpdate() {
        this.updateModalBounds();
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateModalBounds);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateModalBounds);
    }

    updateModalBounds = () => {
        if (this.container.current) {
            const modalContainer = ReactDOM.findDOMNode(this.container.current).parentElement.parentElement.parentElement;
            const rect = modalContainer.getBoundingClientRect();
            if (this.state.modalBounds.top !== rect.top || this.state.modalBounds.bottom !== rect.bottom) {
                this.setState({modalBounds: {top: rect.top, bottom: rect.bottom}});
            }
        }
    }

    setSuggestionRef = (ref) => {
        this.suggestionRef = ref;
    }

    onFocus = () => {
        this.setState({focused: true});

        if (this.props.toggleFocus) {
            this.props.toggleFocus(true);
        }
    }

    onBlur = () => {
        this.setState({focused: false});

        if (this.props.toggleFocus) {
            this.props.toggleFocus(false);
        }
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
            disabled,
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
                <div
                    className={inputClassName}
                    ref={this.container}
                >
                    <SuggestionBox
                        placeholder={placeholder}
                        ref={this.setSuggestionRef}
                        listComponent={ModalSuggestionList}
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
                        disabled={disabled}
                        listStyle={this.dropDirection}
                        modalBounds={this.state.modalBounds}
                    />
                    {helpTextContent}
                    {footer}
                </div>
            </div>
        );
    }
}
