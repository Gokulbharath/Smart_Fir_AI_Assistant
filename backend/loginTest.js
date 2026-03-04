import fetch from 'node-fetch';

(async () => {
  try {
    const r = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin123@police.gov.in', password: 'admin@gov' })
    });
    console.log('status', r.status);
    console.log(await r.text());
  } catch (e) {
    console.error('error', e);
  }
})();