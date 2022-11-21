// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {Stripe} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {isEmpty} from 'lodash';

import {CloudCustomer, Product, Invoice} from '@mattermost/types/cloud';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {
    TELEMETRY_CATEGORIES,
    CloudProducts,
    BillingSchemes,
} from 'utils/constants';

import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import RootPortal from 'components/root_portal';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import BackgroundSvg from 'components/common/svg_images_components/background_svg';
import {ModalData} from 'types/actions';
import {Team} from '@mattermost/types/teams';
import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import PurchaseScreen from '../purchase_screen';

import ProcessPaymentSetup from '../process_payment_setup';

import 'components/payment_form/payment_form.scss';

import '../purchase.scss';
import { BillingDetails } from 'types/cloud/sku';

let stripePromise: Promise<Stripe | null>;

type Props = {
    customer: CloudCustomer | undefined;
    show: boolean;
    isDevMode: boolean;
    products: Record<string, Product> | undefined;
    contactSupportLink: string;
    contactSalesLink: string;
    isFreeTrial: boolean;
    productId: string | undefined;
    currentTeam: Team;
    intl: IntlShape;
    theme: Theme;
    isDelinquencyModal?: boolean;
    invoices?: Invoice[];
    isCloudDelinquencyGreaterThan90Days: boolean;

    // callerCTA is information about the cta that opened this modal. This helps us provide a telemetry path
    // showing information about how the modal was opened all the way to more CTAs within the modal itself
    callerCTA?: string;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: () => void;
        getCloudProducts: () => void;
        completeStripeAddPaymentMethod: (
            stripe: Stripe,
            billingDetails: BillingDetails,
            isDevMode: boolean
        ) => Promise<boolean | null>;
        subscribeCloudSubscription: (
            productId: string
        ) => Promise<boolean | null>;
        getClientConfig: () => void;
        getCloudSubscription: () => void;
        getInvoices: () => void;
    };
};

type State = {
    paymentInfoIsValid: boolean;
    billingDetails: BillingDetails | null;
    cardInputComplete: boolean;
    processing: boolean;
    editPaymentInfo: boolean;
    currentProduct: Product | null | undefined;
    selectedProduct: Product | null | undefined;
    isUpgradeFromTrial: boolean;
    buttonClickedInfo: string;
}

/**
 *
 * @param products  Record<string, Product> | undefined - the list of current cloud products
 * @param productId String - a valid product id used to find a particular product in the dictionary
 * @param productSku String - the sku value of the product of type either cloud-starter | cloud-professional | cloud-enterprise
 * @returns Product
 */
function findProductInDictionary(products: Record<string, Product> | undefined, productId?: string | null, productSku?: string): Product | null {
    if (!products) {
        return null;
    }
    const keys = Object.keys(products);
    if (!keys.length) {
        return null;
    }
    if (!productId && !productSku) {
        return products[keys[0]];
    }
    let currentProduct = products[keys[0]];
    if (keys.length > 1) {
        // here find the product by the provided id or name, otherwise return the one with Professional in the name
        keys.forEach((key) => {
            if (productId && products[key].id === productId) {
                currentProduct = products[key];
            } else if (productSku && products[key].sku === productSku) {
                currentProduct = products[key];
            }
        });
    }

    return currentProduct;
}

function getSelectedProduct(products: Record<string, Product> | undefined, productId?: string | null) {
    const currentProduct = findProductInDictionary(products, productId);

    let nextSku = CloudProducts.PROFESSIONAL;
    if (currentProduct?.sku === CloudProducts.PROFESSIONAL) {
        nextSku = CloudProducts.ENTERPRISE;
    }
    return findProductInDictionary(products, null, nextSku);
}

class CloudPurchaseModal extends React.PureComponent<Props, State> {
    modal = React.createRef();

    public constructor(props: Props) {
        super(props);
        this.state = {
            paymentInfoIsValid: false,
            billingDetails: null,
            cardInputComplete: false,
            processing: false,
            editPaymentInfo: isEmpty(props.customer?.payment_method && props.customer?.billing_address),
            currentProduct: findProductInDictionary(props.products, props.productId),
            selectedProduct: getSelectedProduct(props.products, props.productId),
            isUpgradeFromTrial: props.isFreeTrial,
            buttonClickedInfo: '',
        };
    }

    async componentDidMount() {
        if (isEmpty(this.state.currentProduct || this.state.selectedProduct)) {
            await this.props.actions.getCloudProducts();
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({
                currentProduct: findProductInDictionary(this.props.products, this.props.productId),
                selectedProduct: getSelectedProduct(this.props.products, this.props.productId),
            });
        }

        if (this.props.isDelinquencyModal) {
            pageVisited(
                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                'pageview_delinquency_cc_update',
            );
            this.props.actions.getInvoices();
        } else {
            pageVisited(TELEMETRY_CATEGORIES.CLOUD_PURCHASING, 'pageview_purchase');
        }

        this.props.actions.getClientConfig();
    }

    setIsUpgradeFromTrialToFalse = () => {
        this.setState({isUpgradeFromTrial: false});
    }

    contactSalesLink = (text: ReactNode) => {
        return (
            <a
                className='footer-text'
                onClick={() => {
                    trackEvent(
                        TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                        'click_contact_sales',
                    );
                }}
                href={this.props.contactSalesLink}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text}
            </a>
        );
    }

    editPaymentInfoHandler = () => {
        this.setState((prevState: State) => {
            return {
                ...prevState,
                editPaymentInfo: !prevState.editPaymentInfo,
            };
        });
    }

    render() {
        if (!stripePromise) {
            stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
        }
        return (
            <Elements
                options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
                stripe={stripePromise}
            >
                <RootPortal>
                    <FullScreenModal
                        show={Boolean(this.props.show)}
                        onClose={() => {
                            trackEvent(
                                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                                'click_close_purchasing_screen',
                            );
                            this.props.actions.getCloudSubscription();
                            this.props.actions.closeModal();
                        }}
                        ref={this.modal}
                        ariaLabelledBy='purchase_modal_title'
                        overrideTargetEvent={false}
                    >
                        <div className='PurchaseModal'>
                            {this.state.processing ? (
                                <div>
                                    <ProcessPaymentSetup
                                        stripe={stripePromise}
                                        billingDetails={this.state.billingDetails}
                                        addPaymentMethod={
                                            this.props.actions.completeStripeAddPaymentMethod
                                        }
                                        subscribeCloudSubscription={
                                            this.props.actions.subscribeCloudSubscription
                                        }
                                        isDevMode={this.props.isDevMode}
                                        onClose={() => {
                                            this.props.actions.getCloudSubscription();
                                            this.props.actions.closeModal();
                                        }}
                                        onBack={() => {
                                            this.setState({processing: false});
                                        }}
                                        contactSupportLink={this.props.contactSalesLink}
                                        currentTeam={this.props.currentTeam}
                                        onSuccess={() => {
                                            // Success only happens if all invoices have been paid.
                                            if (this.props.isDelinquencyModal) {
                                                trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'paid_arrears');
                                            }
                                        }}
                                        selectedProduct={this.state.selectedProduct}
                                        currentProduct={this.state.currentProduct}
                                        isProratedPayment={(!this.props.isFreeTrial && this.state.currentProduct?.billing_scheme === BillingSchemes.FLAT_FEE) &&
                                        this.state.selectedProduct?.billing_scheme === BillingSchemes.PER_SEAT}
                                        setIsUpgradeFromTrialToFalse={this.setIsUpgradeFromTrialToFalse}
                                        isUpgradeFromTrial={this.state.isUpgradeFromTrial}
                                        telemetryProps={{
                                            callerInfo: this.state.buttonClickedInfo,
                                        }}
                                    />
                                </div>
                            ) : null}
                            <PurchaseScreen
                                callerCTA={this.props.callerCTA}
                                setBillingDetauls={(billing) => this.setState({billingDetails: billing})}
                                theme={this.props.theme}
                            />
                            <div className='background-svg'>
                                <BackgroundSvg/>
                            </div>
                        </div>
                    </FullScreenModal>
                </RootPortal>
            </Elements>
        );
    }
}

export default injectIntl(CloudPurchaseModal);
