import mongoose from 'mongoose';
import dns from 'dns';

require('dotenv').config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO2_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO2_URI is not defined in environment variables');
    }

    // Set DNS servers to Google DNS to avoid local DNS server issues
    // This fixes ECONNREFUSED errors when local DNS doesn't respond to Node.js queries
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

    // Check if connection string already includes credentials (mongodb+srv://user:pass@...)
    const hasCredentialsInUri = mongoUri.includes('@') && mongoUri.includes('://');
    
    const options: mongoose.ConnectOptions = {
      // Only add auth options if credentials are NOT in the URI
      ...(hasCredentialsInUri ? {} : {
        authSource: 'admin',
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
      }),
    };

    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string format:', hasCredentialsInUri ? 'URI with embedded credentials' : 'URI with separate credentials');
    
    // Check if database name is missing (connection string ends with /? or just ?)
    if (mongoUri.match(/\.mongodb\.net\/\?/) || mongoUri.match(/\.mongodb\.net\?/)) {
      console.warn('⚠️  Warning: Database name appears to be missing from connection string.');
      console.warn('   Format should be: mongodb+srv://user:pass@cluster.mongodb.net/database_name?options');
    }
    
    await mongoose.connect(mongoUri, options);
    console.log('✅ Connected to MongoDB successfully');
    console.log('   Database:', mongoose.connection.db?.databaseName || 'default');
   
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB');
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      const errorCode = (error as any).code;
      
      // Check for IP whitelist errors (most specific first)
      if (
        errorMsg.includes('is not whitelisted') ||
        errorMsg.includes('ip not whitelisted') ||
        errorMsg.includes('whitelist') ||
        errorCode === 8000 ||
        (errorMsg.includes('connection') && errorMsg.includes('refused') && errorMsg.includes('mongodb'))
      ) {
        console.error('🔒 IP ADDRESS NOT WHITELISTED');
        console.error('   Your IP address is not in the MongoDB Atlas whitelist.');
        console.error('   To fix this:');
        console.error('   1. Go to MongoDB Atlas → Network Access');
        console.error('   2. Click "Add IP Address"');
        console.error('   3. Add your current IP or use "Allow Access from Anywhere" (0.0.0.0/0) for development');
        console.error('   4. Wait a few minutes for changes to propagate');
      }
      // Check for connection refused (general network/firewall)
      else if (
        errorMsg.includes('econnrefused') ||
        errorMsg.includes('connection refused') ||
        errorCode === 'ECONNREFUSED'
      ) {
        console.error('🚫 CONNECTION REFUSED');
        console.error('   The MongoDB server refused the connection.');
        console.error('   Possible causes:');
        console.error('   - MongoDB server is not running');
        console.error('   - Firewall is blocking the connection');
        console.error('   - Wrong host/port in connection string');
        console.error('   - Network connectivity issues');
      }
      // Check for authentication errors
      else if (
        errorMsg.includes('authentication') ||
        errorMsg.includes('auth failed') ||
        errorMsg.includes('invalid credentials') ||
        errorCode === 18 || // MongoDB error code for authentication failure
        errorCode === 8000
      ) {
        console.error('🔐 AUTHENTICATION FAILED');
        console.error('   Invalid username or password.');
        console.error('   Check your MONGO2_URI connection string credentials.');
      }
      // Check for DNS/network resolution errors
      else if (
        errorMsg.includes('enotfound') ||
        errorMsg.includes('getaddrinfo') ||
        errorMsg.includes('dns') ||
        errorCode === 'ENOTFOUND'
      ) {
        console.error('🌐 DNS/NETWORK RESOLUTION ERROR');
        console.error('   Cannot resolve MongoDB hostname.');
        console.error('   Check your internet connection and DNS settings.');
      }
      // Check for timeout errors
      else if (
        errorMsg.includes('timeout') ||
        errorMsg.includes('timed out') ||
        errorCode === 'ETIMEDOUT'
      ) {
        console.error('⏱️  CONNECTION TIMEOUT');
        console.error('   Connection attempt timed out.');
        console.error('   Possible causes:');
        console.error('   - Slow network connection');
        console.error('   - Firewall blocking the connection');
        console.error('   - MongoDB server is overloaded');
      }
      // Generic error with full message
      else {
        console.error('❓ UNKNOWN ERROR');
        console.error('   Error message:', error.message);
        console.error('   Error code:', errorCode || 'N/A');
        console.error('   Full error:', error);
      }
    } else {
      console.error('❓ UNKNOWN ERROR TYPE');
      console.error('   Error:', error);
    }
    
    process.exit(1); // Exit on connection failure
  }
};

export default connectDB;
