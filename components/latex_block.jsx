// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class LatexBlock extends React.Component {
    static propTypes = {
        content: PropTypes.string.isRequired,
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
        if (this.state.katex == null) {
            return (
                <div
                    className='post-body--code tex'
                >
                    {this.props.content}
                </div>
            );
        }

        const html = this.state.katex.renderToString(this.props.content, {throwOnError: false, displayMode: true});

        return (
            <div
                className='post-body--code tex'
                dangerouslySetInnerHTML={{__html: html}}
            />
        );
    }
}

