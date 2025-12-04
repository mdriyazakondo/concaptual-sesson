require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 3000;
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf-8"
);

const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
// middleware
app.use(
  cors({
    origin: [process.env.CLIENT_DOMIN],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.json());

// jwt middlewares
const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  console.log(token);
  if (!token) return res.status(401).send({ message: "Unauthorized Access!" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    console.log(decoded);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Unauthorized Access!", err });
  }
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const db = client.db("plant_shop");
    const plantCollection = db.collection("plants");
    const orderCollection = db.collection("orders");
    const userCollection = db.collection("users");

    //===== plants api =========//
    app.get("/plants", async (req, res) => {
      const result = await plantCollection.find().toArray();
      res.send(result);
    });

    app.get("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.findOne(query);
      res.send(result);
    });

    app.post("/plants", async (req, res) => {
      const newPlants = req.body;
      const result = await plantCollection.insertOne(newPlants);
      res.send(result);
    });

    app.put("/plnts/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          updateData,
        },
      };
      const result = await plantCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.deleteOne(query);
      res.send(result);
    });

    //====== Payment Releted api ==========//

    app.post("/create-checkout-session", async (req, res) => {
      const paymentInfo = req.body;
      console.log(paymentInfo);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: paymentInfo.name,
                description: paymentInfo.description,
                images: [paymentInfo.image],
              },
              unit_amount: paymentInfo?.price * 100,
            },
            quantity: paymentInfo?.quantity,
          },
        ],
        customer_email: paymentInfo?.customer.email,
        mode: "payment",
        metadata: {
          plantId: paymentInfo.plantId,
          name: paymentInfo?.customer?.name,
          customer: paymentInfo?.customer?.email,
        },
        success_url: `${process.env.CLIENT_DOMIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_DOMIN}/plant/${paymentInfo.plantId}`,
      });
      res.send({ url: session?.url });
    });

    app.post("/payment-success", async (req, res) => {
      const { sessionId } = req.body;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const plants = await plantCollection.findOne({
        _id: new ObjectId(session?.metadata?.plantId),
      });
      const order = await orderCollection.findOne({
        transationId: session.payment_intent,
      });
      if (session.status === "complete" && plants && !order) {
        const orderInfo = {
          plantId: session?.metadata?.plantId,
          transationId: session.payment_intent,
          customer: session.metadata.customer,
          status: "pending",
          seler: plants.seler,
          name: plants.name,
          category: plants.category,
          quantity: 1,
          image: plants.photoURL,
          price: session.amount_total / 100,
        };

        console.log(orderInfo);
        const result = await orderCollection.insertOne(orderInfo);
        const updatePlant = await plantCollection.updateOne(
          { _id: new ObjectId(session?.metadata?.plantId) },
          { $inc: { quantity: -1 } }
        );
        return res.send({
          transationId: session.payment_intent,
          orderId: result.insertedId,
        });
      }
      res.send({
        transationId: session.payment_intent,
        orderId: result._id,
      });
    });

    //===== get all orders data ==========//

    app.get("/my-orders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection.find({ customer: email }).toArray();
      res.send(result);
    });

    //===== get all manage  data ==========//
    app.get("/manage-orders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection
        .find({ "seler.email": email })
        .toArray();
      res.send(result);
    });

    //===== get all manage  data ==========//
    app.get("/my-inventory/:email", async (req, res) => {
      const email = req.params.email;
      const result = await plantCollection
        .find({ "seler.email": email })
        .toArray();
      res.send(result);
    });

    //======== user releted api  ==============//
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      newUser.create_At = new Date().toISOString();
      newUser.last_loggedIn = new Date().toISOString();
      newUser.role = "customer";
      const query = { email: newUser.email };
      const existUser = await userCollection.findOne(query);
      if (existUser) {
        const updateUser = await userCollection.updateOne(query, {
          $set: { last_loggedIn: new Date().toISOString() },
        });
        return res.send(updateUser);
      }
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.get("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send({ role: result?.role });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Server..");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
