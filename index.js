require("dotenv").config();
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const UserModel = require('./models/user');
const BookingModel = require('./models/booking');
const FeedbackModel = require('./models/feedback');
const PurchasePackageModel = require('./models/Packagepurshase');
const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://starlit-cajeta-fabbe7.netlify.app"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected");
}).catch((e) => {
    console.error("Error in connecting db", e);
});


app.post('/register', async (req, res) => {
    const { firstname, lastname, mobilenumber, email, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            firstname,
            lastname,
            mobilenumber,
            email,
            password: hashedPassword,
            role: "user"
        });
        await newUser.save();
        res.json({ status: "Account created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No record exists" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "The password is incorrect" });
        }
        const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);
        res.json({ status: "Success", name: user.email, role: user.role, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/booking', async (req, res) => {
    try {
        const { name, age, email, persons, city, startdate, enddate, adults, children, totalamount } = req.body;
        const newBooking = new BookingModel({ name, age, email, persons, city, startdate, enddate, adults, children, totalamount });
        await newBooking.save();
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/allusers', async (req, res) => {
    try {
        const allusers = await UserModel.find();
        res.json(allusers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/allbookings', async (req, res) => {
    try {
        const allbookings = await BookingModel.find();
        res.json(allbookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/allfeedback', async (req, res) => {
    try {
        const allfeedback = await FeedbackModel.find();
        res.json(allfeedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/packagaereq', async (req, res) => {
    try {
        const packagaereq = await PurchasePackageModel.find();
        res.json(packagaereq);
    } catch (error) {
        console.error("Error fetching package requests:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/userbooking', async (req, res) => {
    try {
        const { mail } = req.query;
        const userBookings = await BookingModel.find({ email: mail });
        res.json(userBookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user', async (req, res) => {
    try {
        const { email } = req.query;
        const userprofile = await UserModel.findOne({ email });
        res.json(userprofile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Profile Update Endpoint

app.put('/user/update', async (req, res) => {
    const { email, firstname, lastname, mobilenumber } = req.body;

    const sanitizedEmail = email.trim();
    const sanitizedFirstname = firstname.trim();
    const sanitizedLastname = lastname.trim();
    const sanitizedMobilenumber = parseInt(mobilenumber, 10);

    if (!sanitizedEmail || !sanitizedFirstname || !sanitizedLastname || isNaN(sanitizedMobilenumber)) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: sanitizedEmail },
            { firstname: sanitizedFirstname, lastname: sanitizedLastname, mobilenumber: sanitizedMobilenumber }
        );
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { name, email, feedback } = req.body;
        const newFeedback = new FeedbackModel({ name, email, feedback });
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/purchase-package', async (req, res) => {
    try {
        const { firstName, lastName, mobileNumber, email, numberOfAdults, numberOfChildren, packageType } = req.body;
        const newPurchasePackage = new PurchasePackageModel({
            firstName,
            lastName,
            mobileNumber,
            email,
            numberOfAdults,
            numberOfChildren,
            packageType
        });
        await newPurchasePackage.save();
        res.status(201).json(newPurchasePackage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log("Server is connected", process.env.PORT);
});
