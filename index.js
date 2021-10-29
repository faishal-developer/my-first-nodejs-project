const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yaqej.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected t0 database');
        const database = client.db("carMechanic");
        const services = database.collection("Services");

        //read data from database by get method
        app.get('/services', async (req, res) => {
            const page = req.query.page;
            const size = req.query.size;
            const cursor = services.find({});
            const count = await cursor.count()

            let result
            if (page) {
                result = await cursor.skip(page * size).limit(parseInt(size)).toArray();
            } else {
                result = await cursor.toArray();
            }
            res.json({
                count,
                result
            })
        })

        //read single data from database
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectID(id) }
            const result = await services.findOne(query);
            res.json(result)
        })

        //post ap
        app.post('/services', async (req, res) => {
            const doc = req.body;
            const result = await services.insertOne(doc);
            res.json(result)
        })

        //use post to get data by keys
        app.post('/products/bykeys', async (req, res) => {
            const keys = req.body.map(key => ObjectID(key));
            query = { _id: { $in: keys } };
            const result = await services.find(query).toArray()
            res.json(result)
        })

        //delete an document
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectID(id) }
            const result = await services.deleteOne(query)
            res.json(result)
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('lamajahbi');
})

app.listen(port, () => {
    console.log('app is running from 5000');
})