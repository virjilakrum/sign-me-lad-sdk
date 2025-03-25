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
const sdkInfo = document.getElementById('sdk-info');

// State variables
let authToken = null;
let solanaAuth = null;

// Initialize SignMeLad SDK
function initializeSDK() {
  try {
    // Check if SDK is loaded
    if (typeof SignMeLad === 'undefined' || !SignMeLad.SolanaAuth) {
      sdkInfo.className = 'alert alert-danger';
      sdkInfo.innerHTML = '<i class="bi bi-exclamation-triangle"></i> SignMeLad SDK not loaded properly.';
      return false;
    }

    // Initialize the SDK with options
    solanaAuth = new SignMeLad.SolanaAuth({
      network: 'devnet',
      debug: true,
      autoConnect: false
    });

    // Display SDK information
    sdkInfo.className = 'alert alert-info';
    sdkInfo.innerHTML = `<i class="bi bi-info-circle"></i> SignMeLad SDK ${SignMeLad.SDK_VERSION} initialized successfully.`;
    
    return true;
  } catch (error) {
    sdkInfo.className = 'alert alert-danger';
    sdkInfo.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Error initializing SDK: ${error.message}`;
    return false;
  }
}

// Check token on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the SDK
  if (!initializeSDK()) {
    return;
  }

  // Check for token in localStorage
  authToken = localStorage.getItem('authToken');
  
  if (authToken) {
    verifyToken(authToken);
  }
  
  // Check wallet connection status
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

// Check wallet connection
async function checkWalletConnection() {
  try {
    const status = solanaAuth.getStatus();
    
    if (status.isConnected) {
      updateWalletUI(true, status.publicKey);
    } else {
      updateWalletUI(false);
    }
  } catch (error) {
    walletStatus.className = 'alert alert-danger';
    walletStatus.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Error checking wallet: ${error.message}`;
  }
}

// Connect to wallet
async function connectWallet() {
  try {
    // Using the SDK to connect to wallet
    const publicKey = await solanaAuth.connect();
    
    updateWalletUI(true, publicKey);
    updateResultOutput('Wallet Connection', {
      status: 'Success',
      publicKey
    });
  } catch (error) {
    // Check for specific error types from the SDK
    if (error instanceof SignMeLad.WalletNotFoundError) {
      walletStatus.className = 'alert alert-danger';
      walletStatus.innerHTML = '<i class="bi bi-exclamation-triangle"></i> No supported Solana wallet found. Please install Phantom, Solflare, or Sollet wallet.';
    } else if (error instanceof SignMeLad.WalletConnectionError) {
      walletStatus.className = 'alert alert-warning';
      walletStatus.innerHTML = '<i class="bi bi-exclamation-circle"></i> Connection request rejected. Please try again.';
    }
    
    updateWalletUI(false);
    throw error;
  }
}

// Disconnect from wallet
async function disconnectWallet() {
  try {
    // Using the SDK to disconnect
    await solanaAuth.disconnect();
    
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
  try {
    // Using SDK to authenticate
    const authResult = await solanaAuth.authenticate();
    
    // Send to backend
    const response = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authResult)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Authentication failed.');
    }
    
    // Store token
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    
    updateAuthUI(true, authResult.publicKey);
    updateResultOutput('Authentication', {
      status: 'Success',
      token: data.token,
      user: data.user
    });
  } catch (error) {
    // Check for specific error types from the SDK
    if (error instanceof SignMeLad.WalletNotConnectedError) {
      authStatus.className = 'alert alert-warning';
      authStatus.innerHTML = '<i class="bi bi-exclamation-circle"></i> Please connect your wallet first.';
    } else if (error instanceof SignMeLad.SigningError) {
      authStatus.className = 'alert alert-danger';
      authStatus.innerHTML = '<i class="bi bi-exclamation-triangle"></i> User rejected message signing.';
    }
    
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
      const publicKey = data.user.publicKey;
      updateAuthUI(true, publicKey);
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
function updateWalletUI(isConnected, publicKey = null) {
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
function updateAuthUI(isAuthenticated, publicKey = null) {
  if (isAuthenticated && publicKey) {
    authStatus.className = 'alert alert-success';
    authStatus.innerHTML = `<i class="bi bi-person-check"></i> Logged in: <span class="fw-bold">${publicKey.slice(0, 6)}...${publicKey.slice(-4)}</span>`;
    
    loginButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');
    
    protectedButton.disabled = false;
  } else {
    authStatus.className = 'alert alert-secondary';
    authStatus.innerHTML = solanaAuth && solanaAuth.getStatus().isConnected ? 
      'Login to authenticate with your wallet.' : 
      'You need to connect to a wallet first.';
    
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