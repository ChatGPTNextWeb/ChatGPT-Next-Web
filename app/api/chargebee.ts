import { ChargeBee } from "chargebee-typescript";

const chargebee = new ChargeBee();

chargebee.configure({
  site: process.env.NEXT_PUBLIC_CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
});

export const createCustomer = async (data: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}) => {
  const { customer } = await chargebee.customer
    .create({
      email: data.email,
      id: data.id,
      first_name: data.firstName,
      last_name: data.lastName,
    })
    .request();

  return customer;
};

// USE WITH CAUTION
export const deleteCustomer = async (id: string) => {
  const customer = await chargebee.customer.delete(id).request();

  return customer;
};

export const getCustomer = async (id: string) => {
  return chargebee.customer.list({ id: { is: id } }).request();
};

export const updateCustomer = async (
  id: string,
  data: { firstName: string; lastName: string; email: string },
) => {
  return chargebee.customer
    .update(id, {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
    })
    .request();
};

export const createPortalSession = async (id: string) => {
  const session = await chargebee.portal_session
    .create({
      customer: {
        id,
      },
      redirect_url: `https://localhost`,
    })
    .request((err: any, data: any) => {
      if (err) {
        throw new Error(err);
      }
    });

  return session.portal_session as typeof chargebee.portal_session;
};

export const getPortalSession = async (id: string) => {
  const session = await chargebee.portal_session.retrieve(id).request();

  return session.portal_session;
};

export const getSubscriptionEntitlements = async (id: string) => {
  const data = await chargebee.subscription_entitlement
    .subscription_entitlements_for_subscription(id)
    .request();

  return data.list.map((sub: any) => sub.subscription_entitlement);
};

export const getSubscriptionsForUser = async (id: string) => {
  const data = await chargebee.subscription
    .subscriptions_for_customer(id)
    .request();

  return data.list.map((sub: any) => sub.subscription);
};

export const getCheckoutSession = async (id: string) => {
  const data = await chargebee.hosted_page.retrieve(id).request();

  return data.hosted_page;
};

export const createCheckoutSession = async (data: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planId: string;
}) => {
  const { hosted_page } = await chargebee.hosted_page
    .checkout_new_for_items({
      customer: {
        email: data.email,
        id: data.id,
        first_name: data.firstName,
        last_name: data.lastName,
      },
      subscription_items: [
        {
          item_price_id: data.planId,
          quantity: 1,
        },
      ],
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/plans`,
    })
    .request();

  return hosted_page;
};
