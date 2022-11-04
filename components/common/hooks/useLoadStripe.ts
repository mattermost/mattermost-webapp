import {useEffect, useRef, useState} from 'react';
import {Stripe} from '@stripe/stripe-js';

import {STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects

// reloadHint 
export default function useLoadStripe(reloadHint?: number) {
    const stripeRef = useRef<Stripe | null>(null);
    const [,setDone] = useState(false);
  
    useEffect(() => {
        if (stripeRef.current) {
            return
        }
        loadStripe(STRIPE_PUBLIC_KEY).then((stripe: Stripe | null) => {
            stripeRef.current = stripe;

            // deliberately cause a rerender so that the input can render.
            // otherwise, the input does not show up.
            setDone(true);
        });
    }, [reloadHint]);
    return stripeRef;
}
