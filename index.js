const path = require('path');       // files
const express = require('express'); // server
const morgan = require('morgan');   // request logger
const helmet = require('helmet');   // http header security
const {nanoid} = require('nanoid'); // generator
const axios = require('axios');     // http requests

require('dotenv').config();

const app = express();
app.enable('trust proxy');

const QRL_LINK_API = process.env.QRL_LINK_API;

app.use(helmet());
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('./public'));

const notFoundPath = path.join(__dirname, 'public/404.html');

app.post('/api/urls', async (req, res, next) => {
    let {stamp, url} = req.body;

    console.log(req.body.stamp.length);

    try {
        if (!url) {
            throw new Error('Url is empty :v');
        }

        if (url.includes('qrl')) {
            throw new Error('Stop it.');
        }

        if (!stamp) {
            stamp = nanoid(7);
        }

        if (url.length > 250 || stamp.length > 50) {
            throw new Error('Woah, slow down cowboy, too much.');
        }

        const data = JSON.stringify({
            url: url,
            stamp: stamp || undefined,
        })

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        }

        await axios.post(QRL_LINK_API, data, config)
            .then(response => {
                const link = JSON.stringify({
                    qrl: process.env.QRL_LINK + "/" + response.data.stamp,
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
        await axios.get(QRL_LINK_API + "/" + stamp)
            .then(response => {
                res.redirect(response.data.rlink);
            }).catch(error => {
                console.log(error);
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
