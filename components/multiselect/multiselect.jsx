// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';

import {Constants, A11yCustomEventTypes} from 'utils/constants.jsx';
import {isKeyPressed} from 'utils/utils.jsx';
import SaveButton from 'components/save_button.jsx';

import MultiSelectList from './multiselect_list.jsx';

const KeyCodes = Constants.KeyCodes;

export default class MultiSelect extends React.Component {
    static propTypes = {
        users: PropTypes.arrayOf(PropTypes.object),
        totalCount: PropTypes.number,
        options: PropTypes.arrayOf(PropTypes.object),
        optionRenderer: PropTypes.func,
        values: PropTypes.arrayOf(PropTypes.object),
        valueRenderer: PropTypes.func,
        ariaLabelRenderer: PropTypes.func.isRequired,
        handleInput: PropTypes.func,
        handleDelete: PropTypes.func,
        perPage: PropTypes.number,
        handlePageChange: PropTypes.func,
        handleAdd: PropTypes.func,
        handleSubmit: PropTypes.func,
        noteText: PropTypes.node,
        maxValues: PropTypes.number,
        numRemainingText: PropTypes.node,
        buttonSubmitText: PropTypes.node,
        buttonSubmitLoadingText: PropTypes.node,
        submitImmediatelyOn: PropTypes.func,
        saving: PropTypes.bool,
        loading: PropTypes.bool,
        placeholderText: PropTypes.string,
    }

    static defaultProps = {
        ariaLabelRenderer: defaultAriaLabelRenderer,
    }

    constructor(props) {
        super(props);

        this.selected = null;

        this.state = {
            page: 0,
            input: '',
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleEnterPress);
        if (this.refs.reactSelect) {
            this.refs.reactSelect.select.inputRef.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.refs.reactSelect.select.inputRef.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);

            this.refs.reactSelect.focus();
        }
    }

    componentWillUnmount() {
        this.refs.reactSelect.select.inputRef.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
        this.refs.reactSelect.select.inputRef.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);

        document.removeEventListener('keydown', this.handleEnterPress);
    }

    handleA11yActivateEvent = () => {
        this.setState({a11yActive: true});
    }

    handleA11yDeactivateEvent = () => {
        this.setState({a11yActive: false});
    }

    nextPage = () => {
        if (this.props.handlePageChange) {
            this.props.handlePageChange(this.state.page + 1, this.state.page);
        }
        if (this.refs.list) {
            this.refs.list.setSelected(0);
        }
        this.setState({page: this.state.page + 1});
    }

    prevPage = () => {
        if (this.state.page === 0) {
            return;
        }

        if (this.props.handlePageChange) {
            this.props.handlePageChange(this.state.page - 1, this.state.page);
        }
        this.refs.list.setSelected(0);
        this.setState({page: this.state.page - 1});
    }

    resetPaging = () => {
        this.setState({page: 0});
    }

    onSelect = (selected) => {
        this.selected = selected;
    }

    onAdd = (value) => {
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

        this.refs.reactSelect.select.handleInputChange({currentTarget: {value: ''}});
        this.onInput('');
        this.refs.reactSelect.focus();

        const submitImmediatelyOn = this.props.submitImmediatelyOn;
        if (submitImmediatelyOn && submitImmediatelyOn(value)) {
            this.props.handleSubmit([value]);
        }
    }

    onInput = (input, change = {}) => {
        if (change.action === 'input-blur' || change.action === 'menu-close') {
            return;
        }

        if (this.state.input === input) {
            return;
        }

        this.setState({input});

        if (input === '') {
            this.refs.list.setSelected(-1);
        } else {
            this.refs.list.setSelected(0);
        }
        this.selected = null;

        this.props.handleInput(input, this);
    }

    onInputKeyDown = (e) => {
        switch (e.key) {
        case KeyCodes.ENTER[0]:
            e.preventDefault();
            break;
        }
    }

    handleEnterPress = (e) => {
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

    handleOnClick = (e) => {
        e.preventDefault();
        this.props.handleSubmit();
    }

    handleSubmitKeyDown = (e) => {
        if (isKeyPressed(e, KeyCodes.SPACE)) {
            e.preventDefault();
            this.props.handleSubmit();
        }
    }

    onChange = (_, change) => {
        if (change.action !== 'remove-value' && change.action !== 'pop-value') {
            return;
        }

        const values = [...this.props.values];
        for (let i = 0; i < values.length; i++) {
            if (values[i].id === change.removedValue.id) {
                values.splice(i, 1);
                break;
            }
        }

        this.props.handleDelete(values);
    }

    render() {
        const options = Object.assign([], this.props.options);
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
                                    title={title}
                                />
                            )}
                        </FormattedMessage>
                    </div>
                    <div>{this.props.noteText}</div>
                </div>
            );
        }

        const valueMap = {};
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
                    <div className='multi-select__container'>
                        <ReactSelect
                            id='selectItems'
                            ref='reactSelect'
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
                            onKeyDown={this.onInputKeyDown}
                            onChange={this.onChange}
                            value={this.props.values}
                            placeholder={this.props.placeholderText}
                            inputValue={this.state.input}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => this.props.ariaLabelRenderer(option)}
                            aria-label={this.props.placeholderText}
                            className={this.state.a11yActive ? 'multi-select__focused' : ''}
                        />
                        <SaveButton
                            id='saveItems'
                            saving={this.props.saving}
                            disabled={this.props.saving}
                            onClick={this.handleOnClick}
                            onKeyDown={this.handleSubmitKeyDown}
                            defaultMessage={buttonSubmitText}
                            savingMessage={this.props.buttonSubmitLoadingText}
                        />
                    </div>
                    <div className='multi-select__help'>
                        {numRemainingText}
                        {memberCount}
                    </div>
                    <div className='multi-select__help'>
                        {noteTextContainer}
                    </div>
                </div>
                <MultiSelectList
                    ref='list'
                    options={optionsToDisplay}
                    optionRenderer={this.props.optionRenderer}
                    ariaLabelRenderer={this.props.ariaLabelRenderer}
                    page={this.state.page}
                    perPage={this.props.perPage}
                    onPageChange={this.props.handlePageChange}
                    onAdd={this.onAdd}
                    onSelect={this.onSelect}
                    loading={this.props.loading}
                />
                <div className='filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}

function defaultAriaLabelRenderer(option) {
    if (!option) {
        return null;
    }
    return option.label;
}

const nullComponent = () => null;

const paddedComponent = (WrappedComponent) => {
    return (props) => {
        return (
            <div style={{paddingRight: '5px', paddingLeft: '5px', borderRight: '1px solid rgba(0, 126, 255, 0.24)'}}>
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
    control: (base) => {
        return {
            ...base,
            borderRadius: '1px',
            borderColor: 'hsl(0,0%,80%)',
            minHeight: '36px',
            '&:hover': {},
            boxShadow: '',
            backgroundColor: 'hsl(0,0%,100%)',
        };
    },
    multiValue: (base) => {
        return {
            ...base,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(0, 126, 255, 0.24)',
            backgroundColor: 'rgba(0, 126, 255, 0.08)',
            color: '#007eff',
        };
    },
    multiValueRemove: (base) => {
        return {
            ...base,
            ':hover': {
                backgroundColor: 'rgba(0, 126, 255, 0.15)',
            },
        };
    },
};
