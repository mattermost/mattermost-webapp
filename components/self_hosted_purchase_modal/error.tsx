// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed_svg';
import IconMessage from 'components/purchase_modal/icon_message';


import {t} from 'utils/i18n';

interface Props {
  clearError: () => void; 
}

export default function ErrorPage(props: Props) {
    const reduxDispatch = useDispatch<DispatchFunc>();
    const contactSupportLink = useSelector(getCloudContactUsLink)(InquiryType.Technical);

    return (
      <div className='failed'>
          <IconMessage
              title={t('admin.billing.subscription.paymentVerificationFailed')}
              subtitle={t('admin.billing.subscription.paymentFailed')}
              icon={
                  <PaymentFailedSvg
                      width={444}
                      height={313}
                  />
              }
              error={true}
              buttonText={t('self_hosted_signup.retry')}
              buttonHandler={() => {
                  try {
                      Client4.bootstrapSelfHostedSignup(true).
                          then((data) => {
                              reduxDispatch({type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS, data: data.progress});
                          }).finally(() => {
                              props.clearError();
                          });
                  } catch (e) {
                      props.clearError();
                  }
              }}
              linkText={t('admin.billing.subscription.privateCloudCard.contactSupport')}
              linkURL={contactSupportLink}
          />
      </div>
      ) 
}
