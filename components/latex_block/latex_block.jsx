// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class LatexBlock extends React.PureComponent {
    static propTypes = {
        content: PropTypes.string.isRequired,
        enableLatex: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            katex: null,
        };
    }

    componentDidMount() {
        import('katex').then((katex) => {
            this.setState({katex});
        });
    }

    render() {
        if (this.state.katex == null || !this.props.enableLatex) {
            return (
                <div
                    className='post-body--code tex'
                >
                    {this.props.content}
                </div>
            );
        }

        try {
            const katexOptions = {
                throwOnError: false,
                displayMode: true,
                maxSize: 200,
                maxExpand: 100,
                fleqn: true,
            };
            const html = this.state.katex.renderToString(this.props.content, katexOptions);

            return (
                <div
                    className='post-body--code tex'
                    dangerouslySetInnerHTML={{__html: html}}
                />
            );
        } catch (e) {
            return (
                <div
                    className='post-body--code tex'
                >
                    <FormattedMessage
                        id='katex.error'
                        defaultMessage="Couldn't compile your Latex code. Please review the syntax and try again."
                    />
                </div>
            );
        }
    }
}

LatexBlock.defaultProps = {
    enableLatex: false,
};
