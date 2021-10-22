// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React, {LegacyRef} from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {Overlay, Tooltip} from 'react-bootstrap';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {generateId} from 'utils/utils.jsx';

type Props = {
    intl: IntlShape;
    id: string;
    rowType: string;
    inherited?: Record<string, string>;
    selectRow: (id: string) => void;
    additionalValues?: Record<string, React.ReactNode>;
};

type State = {
    open: boolean;
}
export class PermissionDescription extends React.PureComponent<Props, State> {
    private id: string
    private contentRef: React.RefObject<HTMLSpanElement>
    constructor(props: Props) {
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

    openTooltip = (e: React.MouseEvent) => {
        const elm = e.currentTarget.querySelector('span');
        const isElipsis = elm && elm.offsetWidth < elm.scrollWidth;
        this.setState({open: isElipsis || false});
    }

    parentPermissionClicked = (e: React.MouseEvent) => {
        const target = e.target as Element;
        const isInheritLink = target.parentElement && target.parentElement.parentElement && target.parentElement.parentElement.className === 'inherit-link-wrapper';
        if (target.parentElement && target.parentElement.className !== 'permission-description' && !isInheritLink) {
            e.stopPropagation();
        } else if (isInheritLink) {
            this.props.selectRow(this.props.id);
            e.stopPropagation();
        }
    }

    render() {
        const {inherited, id, rowType} = this.props;

        let content;
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
                placement='top'
                target={this.contentRef.current as HTMLElement}
            >
                <Tooltip id={this.id}>
                    {content}
                </Tooltip>
            </Overlay>
        );
        if (content.props.values && Object.keys(content.props.values).length > 0) {
            tooltip = <></>;
        }
        content = (
            <span
                className='permission-description'
                onClick={this.parentPermissionClicked}
                ref={this.contentRef as LegacyRef<HTMLSpanElement>}
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
