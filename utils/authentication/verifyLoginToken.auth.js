const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ApiError = require('../../utils/response/ApiError.util');
const ApiSuccess = require('../../utils/response/ApiSuccess.util');

async function verifyGoogleToken(idToken) {

    console.log(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  if(ticket.getPayload().aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(401, 'Invalid Google ID token');
  }

  const payload = ticket.getPayload();
  return new ApiSuccess(200, 'Google ID token verified successfully', {payload: payload});

} 

module.exports = {
  verifyGoogleToken,
}
