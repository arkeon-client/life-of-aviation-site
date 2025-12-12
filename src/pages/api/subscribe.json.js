export const prerender = false; // Ensure this runs on the server

export async function POST({ request }) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), { status: 400 });
    }

    const API_KEY = import.meta.env.MAILCHIMP_API_KEY;
    const SERVER_PREFIX = import.meta.env.MAILCHIMP_SERVER_PREFIX;
    const AUDIENCE_ID = import.meta.env.MAILCHIMP_AUDIENCE_ID;

    const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed", // 'subscribed' sends them straight to the list
      }),
    });

    const data = await response.json();

    // Check for errors (e.g., already subscribed)
    if (response.status >= 400) {
      // If user is already on the list, Mailchimp returns 400. We treat it as success to the user.
      if (data.title === "Member Exists") {
        return new Response(JSON.stringify({ message: "You are already subscribed!" }), { status: 200 });
      }
      return new Response(JSON.stringify({ message: "Error subscribing" }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Success" }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}