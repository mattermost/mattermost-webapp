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
    }

    constructor(props) {
        super(props);

        this.selected = null;

        this.state = {
            page: 0,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleEnterPress);
        this.refs.select.focus();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleEnterPress);
    }

    nextPage = () => {
        if (this.props.handlePageChange) {
            this.props.handlePageChange(this.state.page + 1, this.state.page);
        }
        this.refs.list.setSelected(0);
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
        this.refs.select.handleInputChange({target: {value: ''}});
        this.onInput('');
        this.refs.select.focus();

        const submitImmediatelyOn = this.props.submitImmediatelyOn;
        if (submitImmediatelyOn && submitImmediatelyOn(value)) {
            this.props.handleSubmit([value]);
        }
    }

    onInput = (input) => {
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

    onChange = (values) => {
        if (values.length < this.props.values.length) {
            this.props.handleDelete(values);
        }
    }

    handleRender = () => {
        return null;
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

        let memberCount;
        if (users && users.length && totalCount) {
            memberCount = (
                <FormattedMessage
                    id='multiselect.numMembers'
                    defaultMessage='{memberOptions, number} of {totalCount, number} members'
                    values={{
                        memberOptions: this.props.users.length,
                        totalCount: this.props.totalCount,
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

        return (
            <div className='filtered-user-list'>
                <div className='filter-row filter-row--full'>
                    <div className='multi-select__container'>
                        <ReactSelect
                            ref='select'
                            multi={true}
                            options={this.props.options}
                            joinValues={true}
                            clearable={false}
                            openOnFocus={true}
                            onInputChange={this.onInput}
                            onInputKeyDown={this.onInputKeyDown}
                            onBlurResetsInput={false}
                            onCloseResetsInput={false}
                            onChange={this.onChange}
                            value={this.props.values}
                            valueKey={this.props.valueKey}
                            valueRenderer={this.props.valueRenderer}
                            menuRenderer={this.handleRender}
                            arrowRenderer={this.handleRender}
                            noResultsText={null}
                            placeholder={localizeMessage('multiselect.placeholder', 'Search and add members')}
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
                        {noteTextContainer}
                        {memberCount}
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

MultiSelect.propTypes = {
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
    totalCount: PropTypes.number,
};
