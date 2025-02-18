# Clone the Repository:
git clone https://github.com/EahsanOrnob/profile-app.git

# Install Dependencies:
npm install

# Environment Variables:
MONGODB_URI=mongodb://localhost:27017/yourdb
JWT_SECRET=your_jwt_secret
WEBHOOK_SECRET=your_webhook_secret

# Run the Server:
npm run dev

## Task 1: User API

# Login
curl -X POST http://192.168.10.48:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jmeahsan@gmail.com",
    "password": "bangladesh"
  }'
get the "YOUR_JWT_TOKEN"

# Create User:
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "secret"}'

# Fetch All Users:
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Fetch User by id:
curl -X GET http://192.168.10.48:3000/api/users/$Id \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"


## Task 2: Webhook
# Send Webhook Event:
# Generate signature
body='{"eventType":"user.created","data":{"id":123,"name":"John"}}'
signature=$(echo -n "$body" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET")

# Send request
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $signature" \
  -d "$body"

