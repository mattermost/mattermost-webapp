// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import MenuIcon from 'components/widgets/icons/menu_icon';
import FilterList from './filter_list';

import './filter.scss';

export type FilterValue = {
    name: string | JSX.Element;
    value: boolean | string | string[];
};

export type FilterValues = {
    [key: string]: FilterValue;
};

export type FilterOption = {
    // Display name of the filter option eg. 'Channels', 'Roles' or <FormattedMessage .../>
    name: string | JSX.Element;

    // List of keys that match the filter values, used to define the order in which the filters appear
    keys: string[];

    // Key value map of filter values with keys matching the keys above
    values: FilterValues;

    // Filter Component type, optional parameter defaults to FilterCheckbox
    type?: React.ElementType;
}

export type FilterOptions = {
    [key: string]: FilterOption;
}

type Props = {
    onFilter: (filters: FilterOptions) => void;
    options: FilterOptions;
    keys: string[];
}

type State = {
    show: boolean;
    options: FilterOptions;
    keys: string[];
    optionsModified: boolean;
}

class Filter extends React.PureComponent<Props, State> {
    private buttonRef: React.RefObject<HTMLButtonElement>;
    private filterRef: React.RefObject<HTMLDivElement>;

    public constructor(props: Props) {
        super(props);

        let options = props.options;
        let keys = props.keys;
        let error = '';
        keys.forEach((key) => {
            const option = options[key];
            if (!option) {
                error = `Invalid Filter key: ${key}, no matching option for given key`;
            } else {
                option.keys.forEach((optionKey) => {
                    if (!option.values[optionKey]) {
                        error = `Invalid Filter option key: ${optionKey}, no matching value for given option key`
                    }
                });
            }
        });

        if (error) {
            options = {};
            keys = [];
            console.error(error);
        }

        this.state = {
            show: false,
            options,
            keys,
            optionsModified: false,
        }

        this.filterRef = React.createRef();
        this.buttonRef = React.createRef();
    }

    componentDidMount = () => {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount = () => {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.filterRef?.current?.contains(event.target as Node)) {
            return;
        }
        this.hidePopover();
    }

    hidePopover = () => {
        this.setState({show: false});
        this.buttonRef?.current?.blur();
    }

    togglePopover = () => {
        if (this.state.show) {
            this.hidePopover();
            return;
        }

        this.setState({show: true});
    }

    updateValues = async (values: FilterValues, optionKey: string) => {
        const options = {...this.state.options};
        options[optionKey].values = {...values};
        this.setState({options, optionsModified: true});
    }

    onFilter = () => {
        const {options} = this.state;
        this.props.onFilter(options)
        this.setState({optionsModified: false, show: false})
    }

    renderFilterOptions = () => {
        const {keys, options} = this.state;
        return keys.map((key: string) => {
            const filter = options[key];
            const FilterListComponent = filter.type || FilterList;

            return (
                <FilterListComponent
                    option={filter}
                    optionKey={key}
                    updateValues={this.updateValues}
                    key={key}
                />
            );
        });
    }

    render() {
        const filters = this.renderFilterOptions();

        return (
            <div
                className='Filter'
                ref={this.filterRef}
            >
                <button
                    className={this.state.show ? 'Filter_button Filter__active' : 'Filter_button'}
                    onClick={this.togglePopover}
                    ref={this.buttonRef}
                >
                    <MenuIcon className='menu-icon'/>

                    <FormattedMessage
                        id='filter.filters'
                        defaultMessage='Filters'
                    />
                </button>

                <div
                    className={this.state.show ? 'Filter_content Filter__show' : 'Filter_content'}
                >
                    <div className='Filter_title'>
                        <FormattedMessage
                            id='filter.title'
                            defaultMessage='Filter by'
                        />
                    </div>

                    <hr/>

                    <div className='Filter_lists'>
                        {filters}
                    </div>

                    <button
                        className='Filter_apply style--none btn btn-primary'
                        disabled={!this.state.optionsModified}
                        onClick={this.onFilter}
                    >
                        <FormattedMessage
                            id='filter.apply'
                            defaultMessage='Apply'
                        />
                    </button>
                </div>
            </div>
        );
    }
}

export default Filter;
