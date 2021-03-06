const path = require('path');       // files
const express = require('express'); // server
const morgan = require('morgan');   // request logger
const helmet = require('helmet');   // http header security
const {nanoid} = require('nanoid'); // generator
const axios = require('axios');     // http requests

require('dotenv').config();

const app = express();
app.enable('trust proxy');

const QURL_LINK_API = process.env.QURL_LINK_API;

app.use(helmet());
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('./public'));

const notFoundPath = path.join(__dirname, 'public/404.html');

app.post('/api/urls', async (req, res, next) => {
    let {stamp, url, usages} = req.body;

    try {
        if (!url) {
            throw new Error('Url is empty :v');
        }

        if (url.includes('q-url')) {
            throw new Error('Stop it.');
        }

        if (!stamp) {
            stamp = nanoid(7);
        }

        if (url.length > 250 || stamp.length > 50) {
            throw new Error('Woah, too long url.');
        }

        if (!(usages = parseInt(usages, 10))) {
            throw new Error('Usages must be an integer value :/');
        }

        if (!usages || usages <= 0) {
            usages = 3;
        } else if (usages >= 100) {
            usages = 100;
        }

        const data = JSON.stringify({
            url: url,
            stamp: stamp || undefined,
            usages: usages
        })

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        }

        await axios.post(QURL_LINK_API, data, config)
            .then(response => {
                const link = JSON.stringify({
                    qurl: process.env.QURL_LINK + "/" + response.data.stamp,
                    usages: response.data.usages
                })

                res.json(link);
            })
            .catch(error => {
                throw new Error(error.response.data.message);
            });

    } catch (error) {
        next(error);
    }
});

app.get('/:stamp', async (req, res, next) => {
    const {stamp: stamp} = req.params;
    try {
        await axios.get(QURL_LINK_API + "/" + stamp)
            .then(response => {
                res.redirect(response.data.rlink);
            }).catch(() => {
                throw new Error();
            });
    } catch (error) {
        return res.status(404).sendFile(notFoundPath);
    }
});


app.use((req, res, next) => {
    res.status(404).sendFile(notFoundPath);
});

app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? 'e' : error.stack,
    });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
