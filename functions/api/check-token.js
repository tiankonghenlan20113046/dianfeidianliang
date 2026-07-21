// Cloudflare Worker: 验证登录 token
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await env.AUTH_KV.get('token:' + token);
    const valid = !!data;

    return new Response(JSON.stringify({ valid: valid }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}