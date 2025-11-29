import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeClient {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  createPaymentIntent(amount: number, currency: string) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  // Additional methods for handling Stripe operations can be added here
}