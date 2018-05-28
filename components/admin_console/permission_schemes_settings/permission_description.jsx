// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape} from 'react-intl';
import {Overlay, Tooltip} from 'react-bootstrap';

import {generateId} from 'utils/utils.jsx';
import Constants from 'utils/constants.jsx';

export class PermissionDescription extends React.Component {
    static propTypes = {
        intl: intlShape.isRequired,
        id: PropTypes.string.isRequired,
        rowType: PropTypes.string.isRequired,
        inherited: PropTypes.object,
        selectRow: PropTypes.func.isRequired,
        additionalValues: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.id = generateId();

        this.state = {
            open: false,
        };
    }

    closeTooltip = () => {
        this.setState({open: false});
    }

    openTooltip = (e) => {
        const elm = e.currentTarget.querySelector('span');
        const isElipsis = elm.offsetWidth < elm.scrollWidth;
        this.setState({open: isElipsis});
    }

    parentPermissionClicked = (e) => {
        const isInheritLink = e.target.parentElement.parentElement.className === 'inherit-link-wrapper';
        if (e.target.parentElement.className !== 'permission-description' && !isInheritLink) {
            e.stopPropagation();
        } else if (isInheritLink) {
            this.props.selectRow(this.props.id);
            e.stopPropagation();
        }
    }

    render() {
        const {inherited, id, rowType} = this.props;

        let content = '';
        if (inherited) {
            content = (
                <span className='inherit-link-wrapper'>
                    <FormattedHTMLMessage
                        id='admin.permissions.inherited_from'
                        values={{
                            name: this.props.intl.formatMessage({
                                id: 'admin.permissions.roles.' + inherited.name + '.name',
                                defaultMessage: inherited.display_name,
                            }),
                        }}
                    />
                </span>
            );
        } else {
            content = (
                <FormattedMessage
                    id={'admin.permissions.' + rowType + '.' + id + '.description'}
                    values={this.props.additionalValues}
                />
            );
        }
        let tooltip = (
            <Overlay
                show={this.state.open}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                target={this.refs.content}
            >
                <Tooltip id={this.id}>
                    {content}
                </Tooltip>
            </Overlay>
        );
        if (content.props.values && Object.keys(content.props.values).length > 0) {
            tooltip = null;
        }
        content = (
            <span
                className='permission-description'
                onClick={this.parentPermissionClicked}
                ref='content'
                onMouseOver={this.openTooltip}
                onMouseOut={this.closeTooltip}
            >
                {content}
                {tooltip}
            </span>
        );

        return content;
    }
}

export default injectIntl(PermissionDescription);
