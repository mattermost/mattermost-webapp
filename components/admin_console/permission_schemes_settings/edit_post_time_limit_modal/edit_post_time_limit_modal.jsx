// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

const INT32_MAX = 2147483647;

export default class EditPostTimeLimitModal extends React.PureComponent {
    static propTypes = {
        config: PropTypes.object.isRequired,
        show: PropTypes.bool,
        onClose: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            updateConfig: PropTypes.func.isRequired,
            getConfig: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            postEditTimeLimit: parseInt(props.config.ServiceSettings.PostEditTimeLimit, 10),
            saving: false,
            errorMessage: '',
        };
    }

    componentDidMount() {
        this.props.actions.getConfig();
    }

    save = async () => {
        this.setState({saving: true, errorMessage: ''});

        const val = parseInt(this.state.postEditTimeLimit, 10);
        if (val !== Constants.UNSET_POST_EDIT_TIME_LIMIT) {
            if (val.toString() === 'NaN' || val <= 0 || val > INT32_MAX) {
                this.setState({errorMessage: localizeMessage('edit_post.time_limit_modal.invalid_time_limit', 'Invalid time limit'), saving: false});
                return false;
            }
        }

        const newConfig = JSON.parse(JSON.stringify(this.props.config));
        newConfig.ServiceSettings.PostEditTimeLimit = val;

        const {error: err} = await this.props.actions.updateConfig(newConfig);
        if (err) {
            this.setState({errorMessage: err, saving: false});
        } else {
            this.setState({saving: false});
            this.props.onClose();
        }

        return true;
    }

    handleOptionChange = (e) => {
        const {value} = e.target;
        if (value === Constants.ALLOW_EDIT_POST_ALWAYS) {
            this.setState({postEditTimeLimit: Constants.UNSET_POST_EDIT_TIME_LIMIT});
        } else {
            this.setState({postEditTimeLimit: ''});
        }
    }

    handleSecondsChange = (e) => {
        const {value} = e.target;
        this.setState({postEditTimeLimit: value});
    }

    render = () => {
        return (
            <Modal
                dialogClassName='a11y__modal admin-modal edit-post-time-limit-modal'
                show={this.props.show}
                role='dialog'
                aria-labelledby='editPostTimeModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                >
                    <Modal.Title
                        componentClass='h1'
                        id='editPostTimeModalLabel'
                    >
                        <FormattedMessage
                            id='edit_post.time_limit_modal.title'
                            defaultMessage='Configure Global Edit Post Time Limit'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormattedMarkdownMessage
                        id='edit_post.time_limit_modal.description'
                        defaultMessage='Setting a time limit **applies to all users** who have the "Edit Post" permissions in any permission scheme.'
                    />
                    <div className='pl-3 pb-3 pt-3'>
                        <div className='pt-3'>
                            <input
                                id='anytime'
                                type='radio'
                                name='limit'
                                value={Constants.ALLOW_EDIT_POST_ALWAYS}
                                checked={this.state.postEditTimeLimit === Constants.UNSET_POST_EDIT_TIME_LIMIT}
                                onChange={this.handleOptionChange}
                            />
                            <label htmlFor='anytime'>
                                <FormattedMessage
                                    id='edit_post.time_limit_modal.option_label_anytime'
                                    defaultMessage='Anytime'
                                />
                            </label>
                        </div>
                        <div className='pt-2'>
                            <input
                                id='timelimit'
                                type='radio'
                                name='limit'
                                value={Constants.ALLOW_EDIT_POST_TIME_LIMIT}
                                checked={this.state.postEditTimeLimit !== Constants.UNSET_POST_EDIT_TIME_LIMIT}
                                onChange={this.handleOptionChange}
                            />
                            <label htmlFor='timelimit'>
                                <FormattedMessage
                                    id='edit_post.time_limit_modal.option_label_time_limit.preinput'
                                    defaultMessage='Can edit for'
                                />
                            </label>
                            <input
                                type='number'
                                className='form-control inline'
                                min='0'
                                step='1'
                                max={INT32_MAX}
                                id='editPostTimeLimit'
                                readOnly={this.state.postEditTimeLimit === Constants.UNSET_POST_EDIT_TIME_LIMIT}
                                onChange={this.handleSecondsChange}
                                value={this.state.postEditTimeLimit === Constants.UNSET_POST_EDIT_TIME_LIMIT ? '' : this.state.postEditTimeLimit}
                            />
                            <label htmlFor='timelimit'>
                                <FormattedMessage
                                    id='edit_post.time_limit_modal.option_label_time_limit.postinput'
                                    defaultMessage='seconds after posting'
                                />
                            </label>
                        </div>
                        <div className='pt-3 light'>
                            <FormattedMessage
                                id='edit_post.time_limit_modal.subscript'
                                defaultMessage='Set the length of time users have to edit their messages after posting.'
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='edit-post-time-limit-modal__error'>
                        {this.state.errorMessage}
                    </div>
                    <button
                        type='button'
                        className='btn btn-cancel'
                        onClick={this.props.onClose}
                    >
                        <FormattedMessage
                            id='confirm_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        id='linkModalCloseButton'
                        type='button'
                        className='btn btn-default'
                        onClick={this.save}
                        disabled={this.state.saving}
                    >
                        <FormattedMessage
                            id={this.state.saving ? t('save_button.saving') : t('edit_post.time_limit_modal.save_button')}
                            defaultMessage='Save Edit Time'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    };
}
