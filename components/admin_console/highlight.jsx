// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import Mark from 'mark.js';
import debounce from 'lodash/debounce';

export default class Highlight extends React.Component {
    static propTypes = {
        filter: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
    }

    constructor(props) {
        super(props);
        this.markInstance = null;
        this.ref = React.createRef();
    }

    redrawHighlight = debounce(() => {
        if (this.markInstance !== null) {
            this.markInstance.unmark();
        }

        if (!this.props.filter) {
            return;
        }

        if (!this.ref.current) {
            return;
        }

        // Is necesary to recreate the instances to get again the DOM elements after the re-render
        this.markInstance = new Mark(this.ref.current);
        this.markInstance.mark(this.props.filter, {accuracy: 'complementary'});
    }, 100, {leading: true, trailing: true});

    render() {
        // Run on next frame
        setTimeout(this.redrawHighlight, 0);
        return (
            <div ref={this.ref}>
                {this.props.children}
            </div>
        );
    }
}
