// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import BlockableLink from 'components/admin_console/blockable_link';
import SaveButton from 'components/save_button';

type Props = {

};

const CompanyInfoEdit: React.FC<Props> = () => {
    return (
        <div className='wrapper--fixed CompanyInfoEdit'>
            <div className='admin-console__header with-back'>
                <div>
                    <BlockableLink
                        to='/admin_console/billing/company_info'
                        className='fa fa-angle-left back'
                    />
                    <FormattedMessage
                        id='admin.billing.company_info_edit.title'
                        defaultMessage='Edit Company Information'
                    />
                </div>
            </div>
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <div style={{border: '1px solid #000', width: '100%', height: '432px'}}>
                        {'Edit Company Info View'}
                    </div>
                </div>
            </div>
            <div className='admin-console-save'>
                <SaveButton
                    saving={false} // TODO
                    // disabled={this.props.isDisabled || !this.state.saveNeeded || (this.canSave && !this.canSave())}
                    // onClick={this.handleSubmit}
                    defaultMessage={(
                        <FormattedMessage
                            id='admin.billing.company_info_edit.save'
                            defaultMessage='Save info'
                        />
                    )}
                />
                <BlockableLink
                    className='cancel-button'
                    to='/admin_console/billing/company_info'
                >
                    <FormattedMessage
                        id='admin.billing.company_info_edit.cancel'
                        defaultMessage='Cancel'
                    />
                </BlockableLink>
            </div>
        </div>
    );
};

export default CompanyInfoEdit;
