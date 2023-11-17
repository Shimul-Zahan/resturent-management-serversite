const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config();


app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DBNAME}:${process.env.DBPASS}@shimulclaster1.85diumq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// middleware for verifing the token
const verify = (req, res, next) => {
    console.log(req.cookies)
    // if(!req.cookies) {
    //     // return res.send({ message: 'Unauthorized access' });
    //     console.log('No cookie')
    // }
    next();
}

async function run() {
    try {
        const menus = client.db("bistroDB").collection("menus");
        const reviews = client.db("bistroDB").collection("reviews");
        const cartCollections = client.db("bistroDB").collection("cartCollections");
        const userCollections = client.db("bistroDB").collection("userCollections");

        app.get('/', verify, (req, res) => {
            res.send('Hello Server yess');
        })

        app.get('/menus', verify, async (req, res) => {
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

        app.get('/carts', async (req, res) => {
            try {
                const email = req.query.email;
                const query = { userEmail: email };
                const result = await cartCollections.find(query).toArray();
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        app.get('/users', async (req, res) => {
            try {
                const result = await userCollections.find().toArray();
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })


        // web security work here
        app.post('/jwt', (req, res) => {
            try {
                const user = req.body;
                const token = jwt.sign(user, process.env.SECRET, { expiresIn: '10h' })
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                }).send({ token: token })
            } catch (err) {
                console.log(err)
            }
        })

        app.post('/logout', (req, res) => {
            res.clearCookie('token', { maxAge: 0 }).send({ message: 'successfully removed cookie' });
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

        app.post('/users', async (req, res) => {
            try {
                const user = req.body;
                console.log(user)
                const email = user.email;
                const query = { email: email }
                const userEmail = await userCollections.findOne(query);
                if (userEmail) {
                    return res.send("Email Already Exist", userEmail);
                }
                const result = await userCollections.insertOne(user);
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        app.delete('/carts/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await cartCollections.deleteOne(query);
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        app.delete('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await userCollections.deleteOne(query);
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        app.patch('/users/admin/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        role: 'admin',
                    }
                }
                const result = await userCollections.updateOne(query, updateDoc);
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