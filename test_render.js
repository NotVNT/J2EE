async function test() {
  try {
    const loginRes = await fetch('https://moneymanager-api-lr63.onrender.com/api/v1.0/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-otp-debug2@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    
    const token = loginData.token;
    console.log('Got token:', token.substring(0, 20) + '...');
    
    const res = await fetch('https://moneymanager-api-lr63.onrender.com/api/v1.0/incomes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: 'luong c',
        amount: 400000,
        date: '2026-03-26',
        categoryId: 1,
        icon: ''
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response body:', data);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
