// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    name: string;
    checked: boolean;
    label: string;
    updateOption: (checked: boolean, name: string) => void;
}

class FilterList extends React.PureComponent<Props> {
    public constructor(props: Props) {
        super(props);
    }

    toggleOption = () => {
        const {checked, name, updateOption} = this.props;
        updateOption(!checked, name);
    }

    render() {
        const {name, checked, label} = this.props;
        return (
            <div className='FilterList_checkbox'>
                <label>
                    <input
                        type='checkbox'
                        id={name}
                        name={name}
                        checked={checked}
                        onChange={this.toggleOption}
                    />

                    {label}
                </label>
            </div>
        );
    }

}

export default FilterList;
