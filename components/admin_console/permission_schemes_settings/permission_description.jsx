// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl';
import {Overlay, Tooltip} from 'react-bootstrap';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {generateId} from 'utils/utils.jsx';
import {intlShape} from 'utils/react_intl';
import Constants from 'utils/constants';

export class PermissionDescription extends React.PureComponent {
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

        this.contentRef = React.createRef();
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
                    <FormattedMarkdownMessage
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
                target={this.contentRef.current}
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
                ref={this.contentRef}
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
/* eslint-enable react/no-string-refs */
