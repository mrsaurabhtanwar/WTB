## Pull Request Checklist

Please review the following items before submitting your pull request:

### 📋 Pre-deployment Checklist

#### ✅ Code Quality
- [ ] Code follows project coding standards
- [ ] No console.log statements left in production code
- [ ] Error handling is properly implemented
- [ ] Code is properly commented where necessary

#### ✅ Configuration
- [ ] `package.json` engines field specifies Node.js `18.x`
- [ ] Server listens on `process.env.PORT` for Azure compatibility
- [ ] LocalAuth userDataDir points to `'./temp/wwebjs_auth'` or similar temp directory
- [ ] No hardcoded ports (uses environment variable)

#### ✅ Required Endpoints
- [ ] Root endpoint `/` exists and returns app status
- [ ] Health check endpoint `/health` exists and returns 200 when healthy
- [ ] QR code endpoint `/qr` exists for WhatsApp authentication
- [ ] Webhook endpoint `/webhook/order-ready` exists for order notifications
- [ ] All endpoints handle errors gracefully

#### ✅ Security & Environment
- [ ] No secrets or API keys committed to repository
- [ ] `.env` files are properly ignored (check `.gitignore`)
- [ ] Environment variables are used for sensitive configuration
- [ ] No database credentials or personal information in code

#### ✅ Azure F1 Compatibility
- [ ] Memory usage optimizations for F1 tier (<1GB)
- [ ] CPU-efficient code (conscious of 165 min/day limit)
- [ ] Proper error handling for Azure App Service environment
- [ ] Uses `WEBSITE_NODE_DEFAULT_VERSION` and other Azure-specific settings

#### ✅ WhatsApp Integration
- [ ] WhatsApp client properly initializes
- [ ] QR code generation works correctly
- [ ] Message sending functionality tested
- [ ] Session persistence configured
- [ ] Graceful shutdown implemented

#### ✅ Testing & Verification
- [ ] Local verification script `verify.sh` passes
- [ ] All unit tests pass (if applicable)
- [ ] Manual testing completed on local environment
- [ ] Health endpoints respond correctly
- [ ] App starts within reasonable time (<2 minutes)

#### ✅ Deployment Ready
- [ ] `deploy.sh` script works with your Azure setup
- [ ] GitHub Actions workflow file is properly configured
- [ ] Azure App Service name is unique globally
- [ ] Publish profile secret is configured in GitHub repository

### 🧪 Testing Results

Please provide the output of running the verification script:

```bash
chmod +x ./verify.sh
./verify.sh
```

**Verification output:**
```
[Paste the output of ./verify.sh here]
```

### � WhatsApp Bot Testing

- [ ] QR code generation tested
- [ ] WhatsApp authentication completed
- [ ] Test message sent successfully
- [ ] Webhook endpoint tested with sample data
- [ ] Order notification format verified

### � Deployment Information

**Azure Configuration:**
- App Service Name: `[your-app-name]`
- Resource Group: `whatsapp-bot-rg`
- Region: `centralindia`
- Tier: `F1 (Free)`

**Environment Variables Set:**
- [ ] `WEBSITE_NODE_DEFAULT_VERSION=18.15.0`
- [ ] `NODE_ENV=production`
- [ ] `SEND_DELAY_MS=600`
- [ ] Other required variables: `[list any custom env vars]`

### 📝 Changes Made

**Description of changes:**
[Describe what changes were made in this PR]

**Files modified:**
- [ ] `server.js` - [describe changes]
- [ ] `package.json` - [describe changes]
- [ ] `whatsapp-client.js` - [describe changes]
- [ ] Other files: [list and describe]

### 🔧 Manual Testing Steps

**To test this PR locally:**

1. Install dependencies: `npm ci`
2. Run verification: `./verify.sh`
3. Start app: `npm start`
4. Visit: `http://localhost:5000`
5. Check QR: `http://localhost:5000/qr`
6. Test webhook: `curl -X POST http://localhost:5000/webhook/order-ready -H "Content-Type: application/json" -d '{"name":"Test","phone":"1234567890","item":"Test Order"}'`

### � Performance Considerations

- [ ] Memory usage tested and optimized for F1 tier
- [ ] CPU usage is minimal during idle time
- [ ] App startup time is reasonable (<2 minutes)
- [ ] No memory leaks detected
- [ ] Proper cleanup on shutdown

### 🔗 Related Issues

Closes #[issue number]
Related to #[issue number]

### 📷 Screenshots (if applicable)

[Add screenshots of the working application, QR codes, or any UI changes]

### 🎯 Deployment Impact

- [ ] This is a breaking change
- [ ] This requires environment variable updates
- [ ] This requires Azure configuration changes
- [ ] This is backward compatible

### ✅ Final Checklist

- [ ] I have tested these changes locally
- [ ] I have run the verification script successfully
- [ ] I have checked that no secrets are exposed
- [ ] I understand this will be deployed to Azure F1 tier
- [ ] I have reviewed the Azure cost implications (should be $0)
- [ ] I have tested the WhatsApp functionality

---

**Additional Notes:**
[Any additional information, concerns, or context about this PR]
