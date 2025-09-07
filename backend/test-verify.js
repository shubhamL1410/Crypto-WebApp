// Test script to verify user authentication
// Run this after starting your server

const testUserVerification = async () => {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('🔐 Testing User Verification...\n');

  try {
    // Step 1: Register a user
    console.log('1️⃣ Registering user...');
    const registerResponse = await fetch(`${baseURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shubham',
        email: 'shubhamlathiya@gmail.com',
        password: '12345678'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration:', registerData.message);
    
    if (!registerResponse.ok) {
      console.log('❌ Registration failed:', registerData.message);
      return;
    }
    
    const token = registerData.token;
    console.log('✅ User registered successfully!\n');
    
    // Step 2: Verify user by logging in
    console.log('2️⃣ Verifying user login...');
    const loginResponse = await fetch(`${baseURL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'shubhamlathiya@gmail.com',
        password: '12345678'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login:', loginData.message);
    
    if (loginResponse.ok) {
      console.log('✅ Login verification successful!');
      console.log('User:', loginData.user.name);
      console.log('Email:', loginData.user.email);
      console.log('Token received:', loginData.token.substring(0, 20) + '...\n');
    } else {
      console.log('❌ Login verification failed:', loginData.message);
      return;
    }
    
    // Step 3: Verify JWT token validity
    console.log('3️⃣ Verifying JWT token...');
    const profileResponse = await fetch(`${baseURL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const profileData = await profileResponse.json();
    
    if (profileResponse.ok) {
      console.log('✅ JWT token verification successful!');
      console.log('Authenticated user:', profileData.name);
      console.log('User ID:', profileData._id);
    } else {
      console.log('❌ JWT token verification failed:', profileData.message);
    }
    
    // Step 4: Test invalid token
    console.log('\n4️⃣ Testing invalid token...');
    const invalidTokenResponse = await fetch(`${baseURL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token_here',
        'Content-Type': 'application/json'
      }
    });
    
    const invalidTokenData = await invalidTokenResponse.json();
    console.log('Invalid token response:', invalidTokenData.message);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🏁 User verification tests completed!');
};

// Run the test
testUserVerification();
