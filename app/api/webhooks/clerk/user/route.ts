import { createCustomer, getCustomer } from "@/app/api/chargebee";
import verifyWebhook from "./auth";
import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer } from "@/app/api/chargebee";
import { updateCustomer } from "@/app/api/chargebee";

const handle = async (req: NextRequest) => {
  const event = await verifyWebhook(req);

  switch (event.type) {
    case "user.created": {
      const { email_addresses, first_name, id, last_name } = event.data;

      let email = email_addresses.filter(
        (email) => email.verification?.status === "verified",
      )?.[0]?.email_address;

      if (!email) {
        email = email_addresses[0].email_address;
      }

      console.log("[Webhooks::Clerk::User] Creating customer with id: ", {
        id,
      });
      await createCustomer({
        id,
        firstName: first_name,
        lastName: last_name,
        email: email_addresses[0].email_address,
      });

      return NextResponse.json(
        {
          hit: true,
        },
        {
          status: 200,
        },
      );
    }
    case "user.updated": {
      const { email_addresses, first_name, last_name, id } = event.data;

      let email = email_addresses.filter(
        (email) => email.verification?.status === "verified",
      )?.[0]?.email_address;

      if (!email) {
        email = email_addresses[0].email_address;
      }

      console.log("[Webhooks::Clerk::User] Updating customer with id: ", {
        id,
      });
      await updateCustomer(id, {
        firstName: first_name,
        lastName: last_name,
        email,
      });

      return NextResponse.json(
        {
          hit: true,
        },
        {
          status: 200,
        },
      );
    }
    case "user.deleted": {
      const { id } = event.data;

      if (id) {
        console.log("[Webhooks::Clerk::User] Deleting customer with id: ", {
          id,
        });
        await deleteCustomer(id);

        return NextResponse.json(
          {
            hit: true,
          },
          {
            status: 200,
          },
        );
      }

      return NextResponse.json(
        {
          hit: false,
        },
        {
          status: 200,
        },
      );
    }
    default:
      break;
  }

  return NextResponse.json(
    {},
    {
      status: 200,
      statusText: "OK",
    },
  );
};

export const POST = handle;

export const runtime = "nodejs";
