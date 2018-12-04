// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';

import FormError from 'components/form_error.jsx';

import Setting from './setting.jsx';

export default class MultiSelectSetting extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        values: PropTypes.array.isRequired,
        label: PropTypes.node.isRequired,
        selected: PropTypes.array.isRequired,
        mustBePresent: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        setByEnv: PropTypes.bool.isRequired,
        helpText: PropTypes.node,
        noResultText: PropTypes.node,
        errorText: PropTypes.node,
        notPresent: PropTypes.node,
    };

    static defaultProps = {
        disabled: false,
    };

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.state = {error: false};
    }

    handleChange(newValue) {
        const values = newValue.map((n) => {
            return n.value;
        });

        if (this.props.selected.length > 0 && this.props.mustBePresent && values.join(',').indexOf(this.props.mustBePresent) === -1) {
            this.setState({error: this.props.notPresent});
        } else {
            this.props.onChange(this.props.id, values);
            this.setState({error: false});
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) { // eslint-disable-line camelcase
        if (newProps.selected.length > 0 && newProps.mustBePresent && newProps.selected.join(',').indexOf(newProps.mustBePresent) === -1) {
            this.setState({error: this.props.notPresent});
        } else {
            this.setState({error: false});
        }
    }

    calculateValue = () => {
        return this.props.selected.reduce((values, item) => {
            const found = this.props.values.find((e) => {
                return e.value === item;
            });
            if (found !== null) {
                values.push(found);
            }
            return values;
        }, []);
    };

    getOptionLabel = ({text}) => text;

    render() {
        return (
            <Setting
                label={this.props.label}
                inputId={this.props.id}
                helpText={this.props.helpText}
                setByEnv={this.props.setByEnv}
            >
                <ReactSelect
                    id={this.props.id}
                    isMulti={true}
                    getOptionLabel={this.getOptionLabel}
                    options={this.props.values}
                    delimiter={','}
                    clearable={false}
                    disabled={this.props.disabled || this.props.setByEnv}
                    noResultsText={this.props.noResultText}
                    onChange={this.handleChange}
                    value={this.calculateValue()}
                />
                <FormError error={this.state.error}/>
            </Setting>
        );
    }
}
