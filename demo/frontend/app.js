// Backend API URL
const API_URL = 'http://localhost:3000';

// DOM elements
const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const protectedButton = document.getElementById('protected-button');
const walletStatus = document.getElementById('wallet-status');
const authStatus = document.getElementById('auth-status');
const protectedContent = document.getElementById('protected-content');
const resultOutput = document.getElementById('result-output');

// State variables
let currentWallet = null;
let publicKey = null;
let authToken = null;

// Check token on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check for token in localStorage
  authToken = localStorage.getItem('authToken');
  
  if (authToken) {
    verifyToken(authToken);
  }
  
  // Check wallet connection
  checkWalletConnection();
});

// Wallet connect button
connectButton.addEventListener('click', async () => {
  try {
    await connectWallet();
  } catch (error) {
    updateResultOutput('Connection Error', error);
  }
});

// Wallet disconnect button
disconnectButton.addEventListener('click', async () => {
  try {
    await disconnectWallet();
  } catch (error) {
    updateResultOutput('Disconnect Error', error);
  }
});

// Login button
loginButton.addEventListener('click', async () => {
  try {
    await authenticate();
  } catch (error) {
    updateResultOutput('Authentication Error', error);
  }
});

// Logout button
logoutButton.addEventListener('click', () => {
  logout();
});

// Protected content button
protectedButton.addEventListener('click', async () => {
  try {
    await getProtectedContent();
  } catch (error) {
    updateResultOutput('Protected Content Error', error);
  }
});

// Detect Solana wallet
function detectWallet() {
  // Phantom Wallet
  if (window.phantom?.solana) {
    return window.phantom.solana;
  }
  
  // Solflare Wallet
  if (window.solflare) {
    return window.solflare;
  }
  
  // Sollet Wallet
  if (window.sollet) {
    return window.sollet;
  }
  
  // Slope Wallet
  if (window.slope) {
    return window.slope;
  }
  
  return null;
}

// Check wallet connection
function checkWalletConnection() {
  currentWallet = detectWallet();
  
  if (!currentWallet) {
    walletStatus.className = 'alert alert-danger';
    walletStatus.innerHTML = '<i class="bi bi-exclamation-triangle"></i> No supported Solana wallet found. Please install Phantom, Solflare, or Sollet wallet.';
    return;
  }
  
  if (currentWallet.isConnected) {
    publicKey = currentWallet.publicKey.toString();
    updateWalletUI(true);
  } else {
    updateWalletUI(false);
  }
}

// Connect to wallet
async function connectWallet() {
  currentWallet = detectWallet();
  
  if (!currentWallet) {
    throw new Error('No supported Solana wallet found.');
  }
  
  try {
    const resp = await currentWallet.connect();
    publicKey = resp.publicKey.toString();
    
    updateWalletUI(true);
    updateResultOutput('Wallet Connection', {
      status: 'Success',
      publicKey
    });
  } catch (error) {
    updateWalletUI(false);
    throw error;
  }
}

// Disconnect from wallet
async function disconnectWallet() {
  if (!currentWallet) {
    return;
  }
  
  try {
    await currentWallet.disconnect();
    publicKey = null;
    
    // Also logout
    logout();
    
    updateWalletUI(false);
    updateResultOutput('Wallet Disconnected', {
      status: 'Success'
    });
  } catch (error) {
    throw error;
  }
}

// Authenticate
async function authenticate() {
  if (!currentWallet || !publicKey) {
    throw new Error('You must connect to a wallet first.');
  }
  
  try {
    // Create message to sign
    const timestamp = Date.now();
    const message = `By signing this message, you are authenticating with your wallet address ${publicKey}.

This action does not initiate any transaction or transfer any funds from your wallet.

Timestamp: ${timestamp}`;
    
    // Sign the message
    const encodedMessage = new TextEncoder().encode(message);
    const signatureBytes = await currentWallet.signMessage(encodedMessage);
    const signature = bs58.encode(signatureBytes);
    
    // Send to backend
    const response = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publicKey,
        signature,
        message,
        timestamp
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Authentication failed.');
    }
    
    // Store token
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    
    updateAuthUI(true);
    updateResultOutput('Authentication', {
      status: 'Success',
      token: data.token,
      user: data.user
    });
  } catch (error) {
    throw error;
  }
}

// Verify token
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    
    if (data.success) {
      publicKey = data.user.publicKey;
      updateAuthUI(true);
      updateResultOutput('Token Verification', {
        status: 'Success',
        user: data.user
      });
      return true;
    } else {
      logout();
      return false;
    }
  } catch (error) {
    logout();
    return false;
  }
}

// Logout
function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
  
  updateAuthUI(false);
  updateResultOutput('Logged Out', {
    status: 'Success'
  });
}

// Get protected content
async function getProtectedContent() {
  if (!authToken) {
    throw new Error('You must be logged in to view protected content.');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/protected`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to retrieve protected content.');
    }
    
    protectedContent.className = 'alert alert-success';
    protectedContent.innerHTML = `<i class="bi bi-unlock"></i> Protected content: ${data.message} (${data.user.publicKey})`;
    
    updateResultOutput('Protected Content', {
      status: 'Success',
      data
    });
  } catch (error) {
    protectedContent.className = 'alert alert-danger';
    protectedContent.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Error: ${error.message}`;
    throw error;
  }
}

// Update wallet UI
function updateWalletUI(isConnected) {
  if (isConnected && publicKey) {
    walletStatus.className = 'alert alert-success';
    walletStatus.innerHTML = `<i class="bi bi-check-circle"></i> Connected: <span class="fw-bold">${publicKey.slice(0, 6)}...${publicKey.slice(-4)}</span> <span class="text-muted">(${publicKey})</span>`;
    
    connectButton.classList.add('hidden');
    disconnectButton.classList.remove('hidden');
    
    loginButton.disabled = false;
    authStatus.innerHTML = 'Login to authenticate with your wallet.';
  } else {
    walletStatus.className = 'alert alert-warning';
    walletStatus.innerHTML = '<i class="bi bi-exclamation-circle"></i> Wallet not connected.';
    
    connectButton.classList.remove('hidden');
    disconnectButton.classList.add('hidden');
    
    loginButton.disabled = true;
    authStatus.className = 'alert alert-secondary';
    authStatus.innerHTML = 'You need to connect to a wallet first.';
  }
}

// Update authentication UI
function updateAuthUI(isAuthenticated) {
  if (isAuthenticated) {
    authStatus.className = 'alert alert-success';
    authStatus.innerHTML = `<i class="bi bi-person-check"></i> Logged in: <span class="fw-bold">${publicKey.slice(0, 6)}...${publicKey.slice(-4)}</span>`;
    
    loginButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');
    
    protectedButton.disabled = false;
  } else {
    authStatus.className = 'alert alert-secondary';
    authStatus.innerHTML = publicKey ? 'Login to authenticate with your wallet.' : 'You need to connect to a wallet first.';
    
    loginButton.classList.remove('hidden');
    logoutButton.classList.add('hidden');
    
    protectedButton.disabled = true;
    protectedContent.className = 'alert alert-secondary';
    protectedContent.innerHTML = 'You need to login to see protected content.';
  }
}

// Update result output
function updateResultOutput(title, data) {
  const output = {
    title,
    timestamp: new Date().toISOString(),
    data
  };
  
  resultOutput.textContent = JSON.stringify(output, null, 2);
}