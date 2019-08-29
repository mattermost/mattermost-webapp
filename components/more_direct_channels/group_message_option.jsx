// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';

import AddIcon from 'components/widgets/icons/fa_add_icon';

export default class GroupMessageOption extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        isSelected: PropTypes.bool.isRequired,
        onAdd: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.addValue = this.addValue.bind(this);
    }

    getStyle() {
        let className = 'mentions__name';
        if (this.props.isSelected) {
            className += ' suggestion--selected';
        }
        return className;
    }

    displayName() {
        return this.props.channel.profiles.map((profile) => '@' + profile.username).join(', ');
    }

    addValue() {
        this.props.onAdd(this.props.channel.profiles);
    }

    render() {
        return (
            <div
                key={this.props.channel.id}
                className={'more-modal__row clickable ' + this.getStyle()}
                onClick={this.addValue}
            >
                <div className='more-modal__gm-icon bg-text-200'>
                    {this.props.channel.profiles.length}
                </div>
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {this.displayName()}
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <AddIcon/>
                    </div>
                </div>
            </div>
        );
    }
}
