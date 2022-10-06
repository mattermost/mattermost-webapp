// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import SuggestionBox from 'components/suggestion/suggestion_box';
import SuggestionList from 'components/suggestion/suggestion_list';

import {AppSelectOption} from '@mattermost/types/apps';

import ModalSuggestionList from './suggestion/modal_suggestion_list';
import {Channel} from './suggestion/command_provider/app_command_parser/app_command_parser_dependencies';
import UserProfile from './user_profile/user_profile';
import Provider from './suggestion/provider';

type Select = {
    id: string;
    username: string;
    display_name: string;
    value: string;
    text: string;
}
type Selected = AppSelectOption & UserProfile & Channel & Select;

type Props = {
    onSelected: (selected: Selected) => void;
    value: string;
    providers: Provider[];
    placeholder?: string ;
    footer?: string;
    label?: React.ReactNode;
    labelClassName: string;
    helpText?: React.ReactNode;
    inputClassName: string;
    disabled?: boolean;
    listComponent: typeof ModalSuggestionList | typeof SuggestionList;
    listPosition: string;
    input?: string;
    toggleFocus?: ((opened: boolean) => void) | null;
    id: string;
    setSuggestionRef?: (selected: Selected) => Promise<void>;
}
type State = {
    target?: {value: string};
    focused?: boolean;
    input: string;
}

export default class AutocompleteSelector extends React.PureComponent <Props, State> {
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
        listComponent: PropTypes.elementType,
        listPosition: PropTypes.string,
    };

    static defaultProps = {
        value: '',
        id: '',
        labelClassName: '',
        inputClassName: '',
        listComponent: SuggestionList,
        listPosition: 'top',
    };
    suggestionRef?: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            input: '',
        };
    }

    onChange = (e: State) => {
        if (!e || !e.target) {
            return;
        }

        this.setState({input: e.target.value});
    }

    handleSelected = (selected: Selected) => {
        this.setState({input: ''});

        if (this.props.onSelected) {
            this.props.onSelected(selected);
        }

        requestAnimationFrame(() => {
            if (this.suggestionRef) {
                this.suggestionRef.current?.blur();
            }
        });
    }

    setSuggestionRef = (ref: React.RefObject<HTMLDivElement>) => {
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
            listComponent,
            listPosition,
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
                        listComponent={listComponent}
                        className='form-control'
                        containerClass='select-suggestion-container'
                        value={input}
                        onChange={this.onChange}
                        onItemSelected={this.handleSelected}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        providers={providers}
                        completeOnTab={true}
                        renderNoResults={true}
                        openOnFocus={true}
                        openWhenEmpty={true}
                        replaceAllInputOnSelect={true}
                        disabled={disabled}
                        listPosition={listPosition}
                    />
                    {helpTextContent}
                    {footer}
                </div>
            </div>
        );
    }
}
