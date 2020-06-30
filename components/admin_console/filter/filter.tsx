// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import MenuIcon from 'components/widgets/icons/menu_icon';
import FilterList from './filter_list';

import './filter.scss';

export type FilterValue = {
    name: string;
    value: boolean | string | string[];
};

export type FilterValues = {
    [key: string]: FilterValue;
};

export type FilterOption = {
    // Display name of the filter option eg. 'Channels', 'Roles'
    name: string;

    // List of keys that match the filter values, used to define the order in which the filters appear
    keys: string[];

    values: FilterValues;

    // Filter Component type, optional parameter defaults to FilterCheckbox
    type?: React.ElementType;
}

export type FilterOptions = {
    [key: string]: FilterOption;
}

type Props = {
    onFilter: (filters: any) => void;
    options?: FilterOptions;
    keys?: string[];
}

type State = {
    show: boolean;
    options: FilterOptions;
    keys: string[];
}

class Filter extends React.PureComponent<Props, State> {
    private buttonRef: React.RefObject<HTMLButtonElement>;
    private filterRef: React.RefObject<HTMLDivElement>;

    public constructor(props: Props) {
        super(props);

        const show = false;
        const keys = ['role', 'something', 'something2'];
        const options = {
            'role': {
                name: 'Role',
                values: {
                    'admin': {
                        name: 'Admin',
                        value: false,
                    },
                    'guest': {
                        name: 'Guest',
                        value: false,
                    }
                },
                keys: ['admin', 'guest']
            },
            'something': {
                name: 'Something',
                values: {
                    'admin': {
                        name: 'Admin',
                        value: false,
                    },
                    'guest': {
                        name: 'Guest',
                        value: false,
                    }
                },
                keys: ['admin', 'guest']
            },
            'something2': {
                name: 'Something2',
                values: {
                    'admin': {
                        name: 'Admin',
                        value: false,
                    },
                    'guest': {
                        name: 'Guest',
                        value: false,
                    }
                },
                keys: ['admin', 'guest']
            },
        };

        this.state = {
            show,
            options,
            keys,
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
        this.setState({options});
    }

    renderFilterOptions = () => {
        // const {keys} = this.props;
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
                        id='data_grid.filters'
                        defaultMessage='Filters'
                    />
                </button>

                <div
                    className={this.state.show ? 'Filter_content Filter__show' : 'Filter_content'}
                >
                    <div className='Filter_title'>
                        <FormattedMessage
                            id='data_grid.filters_title'
                            defaultMessage='Filter by'
                        />
                    </div>

                    <hr/>

                    <div className='Filter_lists'>
                        {filters}
                    </div>

                    <button className='Filter_apply btn'>
                        {'Apply'}
                    </button>
                </div>
            </div>
        );
    }
}

export default Filter;
