// Cloudflare Worker: 邮箱验证码登录后端
// 部署为 Cloudflare Pages Functions（放在 /functions/api/ 目录下）

const ALLOWED_EMAIL = '1336026635@qq.com';
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5分钟
const CODE_LENGTH = 6;

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { action, email, code } = body;

    // 检查邮箱是否合法
    if (email && email !== ALLOWED_EMAIL) {
      return corsResponse({
        success: false,
        error: '该邮箱无权访问'
      });
    }

    if (action === 'send') {
      return handleSend(email, env);
    } else if (action === 'verify') {
      return handleVerify(email, code, env);
    } else {
      return corsResponse({ success: false, error: '未知操作' });
    }
  } catch (e) {
    return corsResponse({ success: false, error: '请求格式错误' }, 400);
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

async function handleSend(email, env) {
  if (!email) {
    return corsResponse({ success: false, error: '请输入邮箱' });
  }

  // 检查频率限制（1分钟内只能发一次）
  const rateKey = 'rate:' + email;
  const rateData = await env.AUTH_KV.get(rateKey);
  if (rateData) {
    const elapsed = Date.now() - parseInt(rateData);
    if (elapsed < 60000) {
      const waitSec = Math.ceil((60000 - elapsed) / 1000);
      return corsResponse({ success: false, error: '请 ' + waitSec + ' 秒后重试' });
    }
  }

  // 生成6位验证码
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // 存储验证码
  const storeKey = 'code:' + email;
  await env.AUTH_KV.put(storeKey, JSON.stringify({
    code: code,
    expireAt: Date.now() + CODE_EXPIRY_MS
  }), { expirationTtl: 300 }); // KV 5分钟自动过期

  // 设置频率限制
  await env.AUTH_KV.put(rateKey, String(Date.now()), { expirationTtl: 60 });

  // 发送邮件
  try {
    const sendResult = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [email],
        subject: '电费监控 - 登录验证码',
        html: '<div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">' +
          '<h2 style="color:#0f172a;margin:0 0 8px;">电费电量监控</h2>' +
          '<p style="color:#64748b;margin:0 0 24px;font-size:14px;">您正在登录，验证码如下：</p>' +
          '<div style="font-size:36px;font-weight:bold;color:#0f172a;letter-spacing:8px;text-align:center;padding:20px 0;background:#fff;border-radius:8px;border:1px solid #e2e8f0;">' + code + '</div>' +
          '<p style="color:#94a3b8;font-size:12px;text-align:center;margin:20px 0 0;">验证码 5 分钟内有效，请勿泄露给他人</p>' +
          '</div>'
      })
    });

    if (!sendResult.ok) {
      const errText = await sendResult.text();
      console.error('Resend error:', errText);
      return corsResponse({ success: false, error: '邮件发送失败，请稍后重试' });
    }

    return corsResponse({ success: true, message: '验证码已发送' });
  } catch (e) {
    console.error('Send error:', e);
    return corsResponse({ success: false, error: '邮件发送失败: ' + e.message });
  }
}

async function handleVerify(email, code, env) {
  if (!email || !code) {
    return corsResponse({ success: false, error: '缺少参数' });
  }

  const storeKey = 'code:' + email;
  const data = await env.AUTH_KV.get(storeKey);

  if (!data) {
    return corsResponse({ success: false, error: '验证码已过期，请重新获取' });
  }

  const parsed = JSON.parse(data);

  // 检查是否过期
  if (Date.now() > parsed.expireAt) {
    await env.AUTH_KV.delete(storeKey);
    return corsResponse({ success: false, error: '验证码已过期，请重新获取' });
  }

  // 比对验证码
  if (parsed.code !== code.trim()) {
    return corsResponse({ success: false, error: '验证码错误' });
  }

  // 验证成功，删除验证码
  await env.AUTH_KV.delete(storeKey);

  // 生成登录 token（7天有效）
  const token = generateToken();
  const tokenKey = 'token:' + token;
  await env.AUTH_KV.put(tokenKey, email, { expirationTtl: 7 * 24 * 3600 });

  return corsResponse({ success: true, token: token });
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function corsResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}