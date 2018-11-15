// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';

import {Constants} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';
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
        valueKey: PropTypes.string,
        valueRenderer: PropTypes.func,
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
            this.refs.reactSelect.focus();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleEnterPress);
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

        this.setState({input});

        if (input === '') {
            this.refs.list.setSelected(-1);
        } else {
            this.refs.list.setSelected(0);
        }
        this.selected = null;

        this.props.handleInput(input);
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

    onChange = (_, change) => {
        if (change.action !== 'remove-value' && change.action !== 'pop-value') {
            return;
        }

        const valueKey = this.props.valueKey;
        const values = [...this.props.values];
        for (let i = 0; i < values.length; i++) {
            if (values[i][valueKey] === change.removedValue[valueKey]) {
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
                        <span
                            className='fa fa-info'
                            title={localizeMessage('generic_icons.info', 'Info Icon')}
                        />
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
                            className='btn btn-default filter-control filter-control__next'
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
                            className='btn btn-default filter-control filter-control__prev'
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
                            onInputChange={this.onInput}
                            onKeyDown={this.onInputKeyDown}
                            onChange={this.onChange}
                            value={this.props.values}
                            placeholder={localizeMessage('multiselect.placeholder', 'Search and add members')}
                            inputValue={this.state.input}
                        />
                        <SaveButton
                            saving={this.props.saving}
                            disabled={this.props.saving}
                            onClick={this.handleOnClick}
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