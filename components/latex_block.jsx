// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import React from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {|
    content: string,
|};

type State = {|
    katex?: Object,
|};

export default class LatexBlock extends React.Component<Props, State> {
    constructor(props: Props) {
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
        const katex = this.state.katex;
        const content = this.props.content;

        if (!katex) {
            return (
                <div className='post-body--code tex'>
                    {content}
                </div>
            );
        }

        try {
            const html = katex.renderToString(content, {throwOnError: false, displayMode: true});

            return (
                <div
                    className='post-body--code tex'
                    dangerouslySetInnerHTML={{__html: html}}
                />
            );
        } catch (e) {
            return (
                <div className='post-body--code tex'>
                    <FormattedMessage
                        id='katex.error'
                        defaultMessage="Couldn't compile your Latex code. Please review the syntax and try again."
                    />
                </div>
            );
        }
    }
}
