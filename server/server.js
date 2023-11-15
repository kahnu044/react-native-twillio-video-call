const express = require('express');
const twilio = require('twilio');
const app = express();

require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_ACCOUNT_AUTH_TOKEN = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
const PORT = process.env.PORT || 3000;

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;


app.post('/twilio/create-video-room-token', (req, res) => {

    try {

        const { identity, room } = req.body;

        const accessToken = new AccessToken(
            TWILIO_ACCOUNT_SID,
            TWILIO_API_KEY,
            TWILIO_API_SECRET,
            { identity: identity }
        );

        // Grant access to Video
        var grant = new VideoGrant();
        accessToken.addGrant(grant);

        // Send token to client
        return res.json({
            success: true,
            room: room,
            identity: identity,
            token: accessToken.toJwt()
        });
    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error?.message || error,
            token: ''
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});