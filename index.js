const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// W70XoQoxHaPKVCFV
// bistroBoss

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bistroBoss:W70XoQoxHaPKVCFV@shimulclaster1.85diumq.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const menus = client.db("bistroDB").collection("menus");
        const reviews = client.db("bistroDB").collection("reviews");
        const cartCollections = client.db("bistroDB").collection("cartCollections");
        
        app.get('/', (req, res) => {
            res.send('Hello Server yess');
        })

        app.get('/menus', async (req, res) => {
            try {
                const result = await menus.find().toArray();
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        app.get('/reviews', async (req, res) => {
            try {
                const result = await reviews.find().toArray();
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        app.post('/cart', async (req, res) => {
            try {
                const item = req.body;
                const result = await cartCollections.insertOne(item);
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server Runnig at port: ${port}`)
})