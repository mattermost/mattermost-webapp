// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';

import {InputActionMeta} from 'react-select/src/types';
import {getOptionValue} from 'react-select/src/builtins';

import {Constants, A11yCustomEventTypes} from 'utils/constants';
import SaveButton from 'components/save_button';

import MultiSelectList from './multiselect_list';

export type Value = {
    deleteAt?: number;
    display_name?: string;
    id: string;
    label: string;
    scheme_id?: string;
    value: string;
};

export type Props<T extends Value> = {
    ariaLabelRenderer: getOptionValue<T>;
    buttonSubmitLoadingText?: JSX.Element | string;
    buttonSubmitText?: JSX.Element | string;
    handleAdd: (value: T) => void;
    handleDelete: (values: T[]) => void;
    handleInput: (input: string, multiselect: MultiSelect<T>) => void;
    handlePageChange?: (newPage: number, currentPage: number) => void;
    handleSubmit: (value?: T[]) => void;
    loading?: boolean;
    maxValues?: number;
    noteText?: JSX.Element;
    numRemainingText?: JSX.Element;
    optionRenderer: (
        option: T,
        isSelected: boolean,
        onAdd: (value: T) => void,
        onMouseMove: (value: T) => void
    ) => void;
    selectedItemRef?: React.RefObject<HTMLDivElement>;
    options: T[];
    perPage: number;
    placeholderText?: string;
    saving?: boolean;
    submitImmediatelyOn?: (value: T) => void;
    totalCount?: number;
    users?: unknown[];
    valueRenderer: (props: {data: T}) => any;
    values: T[];
}

export type State = {
    a11yActive: boolean;
    input: string;
    page: number;
}

const KeyCodes = Constants.KeyCodes;

export default class MultiSelect<T extends Value> extends React.PureComponent<Props<T>, State> {
    private listRef = React.createRef<MultiSelectList<T>>()
    private reactSelectRef = React.createRef<ReactSelect>()
    private selected: T | null = null

    public static defaultProps = {
        ariaLabelRenderer: defaultAriaLabelRenderer,
    }

    public constructor(props: Props<T>) {
        super(props);

        this.state = {
            a11yActive: false,
            page: 0,
            input: '',
        };
    }

    public componentDidMount() {
        const inputRef: unknown = this.reactSelectRef.current && this.reactSelectRef.current.select.inputRef;

        document.addEventListener<'keydown'>('keydown', this.handleEnterPress);
        if (inputRef && typeof (inputRef as HTMLElement).addEventListener === 'function') {
            (inputRef as HTMLElement).addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            (inputRef as HTMLElement).addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);

            this.reactSelectRef.current!.focus(); // known from ternary definition of inputRef
        }
    }

    public componentWillUnmount() {
        const inputRef: unknown = this.reactSelectRef.current && this.reactSelectRef.current.select.inputRef;

        if (inputRef && typeof (inputRef as HTMLElement).addEventListener === 'function') {
            (inputRef as HTMLElement).removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            (inputRef as HTMLElement).removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }

        document.removeEventListener('keydown', this.handleEnterPress);
    }

    private handleA11yActivateEvent = () => {
        this.setState({a11yActive: true});
    }

    private handleA11yDeactivateEvent = () => {
        this.setState({a11yActive: false});
    }

    private nextPage = () => {
        if (this.props.handlePageChange) {
            this.props.handlePageChange(this.state.page + 1, this.state.page);
        }
        if (this.listRef.current) {
            this.listRef.current.setSelected(0);
        }
        this.setState({page: this.state.page + 1});
    }

    private prevPage = () => {
        if (this.state.page === 0) {
            return;
        }

        if (this.props.handlePageChange) {
            this.props.handlePageChange(this.state.page - 1, this.state.page);
        }

        if (this.listRef.current) {
            this.listRef.current.setSelected(0);
        }
        this.setState({page: this.state.page - 1});
    }

    public resetPaging = () => {
        this.setState({page: 0});
    }

    private onSelect = (selected: T | null) => {
        this.selected = selected;
    }

    private onAdd = (value: T) => {
        if (this.props.maxValues && this.props.values.length >= this.props.maxValues) {
            return;
        }

        for (let i = 0; i < this.props.values.length; i++) {
            if (this.props.values[i].id === value.id) {
                return;
            }
        }

        this.props.handleAdd(value);
        this.selected = null;

        if (this.reactSelectRef.current) {
            this.reactSelectRef.current.select.handleInputChange(
                {currentTarget: {value: ''}} as React.KeyboardEvent<HTMLInputElement>,
            );
            this.reactSelectRef.current.focus();
        }

        const submitImmediatelyOn = this.props.submitImmediatelyOn;
        if (submitImmediatelyOn && submitImmediatelyOn(value)) {
            this.props.handleSubmit([value]);
        }
    }

    private onInput = (input: string, change: InputActionMeta) => {
        if (!change) {
            return;
        }

        if (change.action === 'input-blur' || change.action === 'menu-close') {
            return;
        }

        if (this.state.input === input) {
            return;
        }

        this.setState({input});

        if (this.listRef.current) {
            if (input === '') {
                this.listRef.current.setSelected(-1);
            } else {
                this.listRef.current.setSelected(0);
            }
        }
        this.selected = null;

        this.props.handleInput(input, this);
    }

    private onInputKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
        case KeyCodes.ENTER[0]:
            e.preventDefault();
            break;
        }
    }

    private handleEnterPress = (e: KeyboardEvent) => {
        switch (e.key) {
        case KeyCodes.ENTER[0]:
            if (this.selected == null) {
                this.props.handleSubmit();
                return;
            }
            this.onAdd(this.selected);
            break;
        }
    }

    private handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        this.props.handleSubmit();
    }

    private onChange: ReactSelect['onChange'] = (_, change) => {
        if (change.action !== 'remove-value' && change.action !== 'pop-value') {
            return;
        }

        const values = [...this.props.values];
        for (let i = 0; i < values.length; i++) {
            // Types of ReactSelect do not match the behavior here,
            if (values[i].id === (change as any).removedValue.id) {
                values.splice(i, 1);
                break;
            }
        }

        this.props.handleDelete(values);
    }

    public render() {
        const options = Object.assign([...this.props.options]);
        const {totalCount, users, values} = this.props;

        let numRemainingText;
        if (this.props.numRemainingText) {
            numRemainingText = this.props.numRemainingText;
        } else if (this.props.maxValues != null) {
            numRemainingText = (
                <FormattedMessage
                    id='multiselect.numRemaining'
                    defaultMessage='You can add {num, number} more. '
                    values={{
                        num: this.props.maxValues - this.props.values.length,
                    }}
                />
            );
        }

        let buttonSubmitText;
        if (this.props.buttonSubmitText) {
            buttonSubmitText = this.props.buttonSubmitText;
        } else if (this.props.maxValues != null) {
            buttonSubmitText = (
                <FormattedMessage
                    id='multiselect.go'
                    defaultMessage='Go'
                />
            );
        }

        let optionsToDisplay = [];
        let nextButton;
        let previousButton;
        let noteTextContainer;

        if (this.props.noteText) {
            noteTextContainer = (
                <div className='multi-select__note'>
                    <div className='note__icon'>
                        <FormattedMessage
                            id='generic_icons.info'
                            defaultMessage='Info Icon'
                        >
                            {(title) => (
                                <span
                                    className='fa fa-info'
                                    title={title as string}
                                />
                            )}
                        </FormattedMessage>
                    </div>
                    <div>{this.props.noteText}</div>
                </div>
            );
        }

        const valueMap: Record<string, boolean> = {};
        for (let i = 0; i < values.length; i++) {
            valueMap[values[i].id] = true;
        }

        for (let i = options.length - 1; i >= 0; i--) {
            if (valueMap[options[i].id]) {
                options.splice(i, 1);
            }
        }

        if (options && options.length > this.props.perPage) {
            const pageStart = this.state.page * this.props.perPage;
            const pageEnd = pageStart + this.props.perPage;
            optionsToDisplay = options.slice(pageStart, pageEnd);
            if (!this.props.loading) {
                if (options.length > pageEnd) {
                    nextButton = (
                        <button
                            className='btn btn-link filter-control filter-control__next'
                            onClick={this.nextPage}
                        >
                            <FormattedMessage
                                id='filtered_user_list.next'
                                defaultMessage='Next'
                            />
                        </button>
                    );
                }

                if (this.state.page > 0) {
                    previousButton = (
                        <button
                            className='btn btn-link filter-control filter-control__prev'
                            onClick={this.prevPage}
                        >
                            <FormattedMessage
                                id='filtered_user_list.prev'
                                defaultMessage='Previous'
                            />
                        </button>
                    );
                }
            }
        } else {
            optionsToDisplay = options;
        }

        let memberCount;
        if (users && users.length && totalCount) {
            memberCount = (
                <FormattedMessage
                    id='multiselect.numMembers'
                    defaultMessage='{memberOptions, number} of {totalCount, number} members'
                    values={{
                        memberOptions: optionsToDisplay.length,
                        totalCount: this.props.totalCount,
                    }}
                />
            );
        }

        return (
            <div className='filtered-user-list'>
                <div className='filter-row filter-row--full'>
                    <div className='multi-select__container react-select'>
                        <ReactSelect
                            id='selectItems'
                            ref={this.reactSelectRef as React.RefObject<any>} // type of ref on @types/react-select is outdated
                            isMulti={true}
                            options={this.props.options}
                            styles={styles}
                            components={{
                                Menu: nullComponent,
                                IndicatorsContainer: nullComponent,
                                MultiValueLabel: paddedComponent(this.props.valueRenderer),
                            }}
                            isClearable={false}
                            openMenuOnFocus={false}
                            menuIsOpen={false}
                            onInputChange={this.onInput}
                            onKeyDown={this.onInputKeyDown as React.KeyboardEventHandler}
                            onChange={this.onChange}
                            value={this.props.values}
                            placeholder={this.props.placeholderText}
                            inputValue={this.state.input}
                            getOptionValue={(option: Value) => option.id}
                            getOptionLabel={this.props.ariaLabelRenderer}
                            aria-label={this.props.placeholderText}
                            className={this.state.a11yActive ? 'multi-select__focused' : ''}
                            classNamePrefix='react-select-auto react-select'
                        />
                        <SaveButton
                            id='saveItems'
                            saving={this.props.saving}
                            disabled={this.props.saving}
                            onClick={this.handleOnClick}
                            defaultMessage={buttonSubmitText}
                            savingMessage={this.props.buttonSubmitLoadingText}
                        />
                    </div>
                    <div
                        id='multiSelectHelpMemberInfo'
                        className='multi-select__help'
                    >
                        {numRemainingText}
                        {memberCount}
                    </div>
                    <div
                        id='multiSelectMessageNote'
                        className='multi-select__help'
                    >
                        {noteTextContainer}
                    </div>
                </div>
                <MultiSelectList
                    ref={this.listRef}
                    options={optionsToDisplay}
                    optionRenderer={this.props.optionRenderer}
                    ariaLabelRenderer={this.props.ariaLabelRenderer}
                    page={this.state.page}
                    perPage={this.props.perPage}
                    onPageChange={this.props.handlePageChange}
                    onAdd={this.onAdd}
                    onSelect={this.onSelect}
                    loading={this.props.loading}
                    selectedItemRef={this.props.selectedItemRef}
                />
                <div className='filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}

function defaultAriaLabelRenderer(option: Value) {
    if (!option) {
        return null;
    }
    return option.label;
}

const nullComponent = () => null;

const paddedComponent = (WrappedComponent: any) => {
    return (props: {data: any}) => {
        return (
            <div style={{paddingLeft: '10px'}}>
                <WrappedComponent {...props}/>
            </div>
        );
    };
};

const styles = {
    container: () => {
        return {
            display: 'table-cell',
            paddingRight: '15px',
            verticalAlign: 'top',
            width: '100%',
        };
    },
};
