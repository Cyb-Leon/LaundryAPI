import express from "express";
import bodyParser from "body-parser";

//API config
const app = express();
const port = 4000;

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//In-memory data store/ test data
const users = [
    {
        "userId": 1,
        "userEmail": "junior@science.co.za",
        "userPassword": "Password@1234"
    },
    {
        "userId": 2,
        "userEmail": "lion@safetymaches.co.za",
        "userPassword": "Password@1234"
    },
    {
        "userId": 3,
        "userEmail": "pmg@weeddj.co.za",
        "userPassword": "Password@1234"
    }
];
const laundryInfo = [
    {
        "userId": 1, "laundryPreferences": {
            preferredDays: ["Friday", "Saturday"],
            loadSize: "Medium",
            averageLoadsPerWeek: 3,
        }
    },
    {
        "userId": 2, "laundryPreferences": {
            preferredDays: ["Saturday", "Sunday"],
            loadSize: "Large",
            averageLoadsPerWeek: 2,
        }
    },
    {
        "userId": 3, "laundryPreferences": {
            preferredDays: ["Wednsday", "Friday"],
            loadSize: "Small",
            averageLoadsPerWeek: 1,
        }
    },
];
const detergentInfo = [
    {
        "userId": 1, "detergentUsagePatterns": {
            detergentBrand: "Ariel",
            detergentType: "Liquid",
            currentLevel: 2, //measured in ltrs
            averageUsagePerLoad: 0.1,
        }
    },
    {
        "userId": 2, "detergentUsagePatterns": {
            detergentBrand: "OMO",
            detergentType: "Powder",
            currentLevel: 5, //measured in ltrs
            averageUsagePerLoad: 0.5,
        }
    },
    {
        "userId": 3, "detergentUsagePatterns": {
            detergentBrand: "Sunlight",
            detergentType: "Powder",
            currentLevel: 3, //measured in ltrs
            averageUsagePerLoad: 0.3,
        }
    },


];
const userProfile = [
    {
        "userId": 1,
        "laundry": laundryInfo.at(0),
        "detergentUsage": detergentInfo.at(0)
    },
    {
        "userId": 2,
        "laundry": laundryInfo.at(1),
        "detergentUsage": detergentInfo.at(1)
    },
    {
        "userId": 3,
        "laundry": laundryInfo.at(2),
        "detergentUsage": detergentInfo.at(2)
    },
];

let lastId = 3;

//routes
//get userProfile
app.get('/profile/:id', (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    //API responds with profile detatils
    const profile = userProfile.find((userProfile) => userProfile.userId == userId);
    console.log(profile);
    res.json(profile);
})
//Post /user/register
app.post('/user/register', (req, res) => {
    //pull from server/form
    console.log(req.body);
    const userData = {
        userId: lastId += 1,
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,
    }

    console.log(userData);
    //# Step 1: Validate the user's input data (e.g., email, password, etc.)
    if (validateUserData(userData) != false) {
        // # Step 2: Save user data to the database
        const userId = saveUserToDatabase(userData);

        // # Step 3: Initialize user profile with default preferences
        initializeUserProfile(userId);

        res.json({ message: "User registered successfully", userId: userId });
    } else {
        res.json({ error: "Invalid user data" });
    }

});

//function for validating user credentials
function validateUserData(userData) {
    if (userData.userEmail && userData.userPassword) {
        return true;
    } else {
        return false;
    }
}

//function for Save user to database
function saveUserToDatabase(userData) {
    //logic to save user data on Postgress
    //in-memory storage
    users.push({
        userId: userData.userId,
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
    })
    return (userData.userId);
}

//function for initialize user profile
function initializeUserProfile(userId) {
    const profileData = {
        userId: userId,
        laundry: {},
        detergentUsage: {},
    };

    saveProfileToDatabase(profileData);
}

//function to saveProfileToDatabase
function saveProfileToDatabase(profileData) {
    //logic to save profile data on Postgress
    //in-memory storage
    userProfile.push(profileData);
}

//POST initial data of the laundry
app.post('/user/laundry-data', (req, res) => {
    // # Step 4: Prompt user to enter initial laundry data
    const userId = req.body.userId;
    const preferredDays = req.body.preferredDays;
    const loadSize = req.body.loadSize;
    const averageLoadsPerWeek = req.body.averageLoadsPerWeek;


    const messageResponse = gatherInitialLaundryData(userId, preferredDays, loadSize, averageLoadsPerWeek);

    //response to the server from API
    res.json(messageResponse);

})
function gatherInitialLaundryData(userId, preferredDays, loadSize, averageLoadsPerWeek) {
    // # Step 1: Ask the user to input their laundry habits
    const laundryData = promptUserForLaundryData(preferredDays, loadSize, averageLoadsPerWeek);

    // # Step 2: Validate the input data
    if (validateLaundryData(laundryData) != false) {
        // # Step 3: Save the laundry data to the user's profile
        saveLaundryData(userId, laundryData);
        //update current user profile
        const usrProfileUpdate = userProfile.find((userProfile) => userProfile.userId == userId);
        usrProfileUpdate.laundry.laundryPreferences = laundryData;

        return { message: "Laundry data saved successfully", userId: userId };
    } else {
        return { error: "Invalid laundry data" };
    }
}

//prompts for laundrydata
function promptUserForLaundryData(preferredDays, loadSize, averageLoadsPerWeek) {
    return {
        preferredDays: preferredDays,
        loadSize: loadSize,
        averageLoadsPerWeek: averageLoadsPerWeek,
    };
}

//validate laundrydata (nonEmpty)
function validateLaundryData(laundryData) {
    if (
        laundryData.preferredDays &&
        laundryData.loadSize &&
        laundryData.averageLoadsPerWeek > 0
    ) {
        return true;
    }
    return false;
}

//save Laundry data to user's profile
function saveLaundryData(userId, laundryData) {
    //logic to store data into postgress

    //in memory storage
    try {
        laundryInfo.push(userId, laundryData);
        console.log("laundry information stored");
    } catch (error) {
        console.log(error);
    }

}

//POST
app.post('/user/detergent-data', (req, res) => {
    // # Step 5: Prompt user to enter initial detergent supply data
    //get userId from previous route response
    const userId = req.body.userId;
    const detergentBrand = req.body.detergentBrand;
    const detergentType = req.body.detergentType;
    const currentLevel = req.body.currentLevel;
    const averageUsagePerLoad = req.body.averageUsagePerLoad;

    const messageResponse = gatherInitialDetergentData(userId, detergentBrand, detergentType, currentLevel, averageUsagePerLoad);

    //API response to server
    res.json(messageResponse);
})
//GET
app.get('/user/detergent-data/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    //get user detergent-data
    if (userId > 0 && userId <= users.length) {
        const userDetergent = userProfile.find((userProfile) => userProfile.userId == userId);

        res.status(200)
            .json(userDetergent.detergentUsage.detergentUsagePatterns);
    } else {
        res
            .status(404)
            .send(`User ID does not exist (ID): ${userId}`)
    }
})

//PATCH
app.patch('/user/detergent-data/', (req, res) => {
    //get ID and search if it exists
    const userId = parseInt(req.body.userId);
    if (userId > 0 && userId <= users.length) {
        const getUserData = userProfile.find((userProfile) => userProfile.userId == userId);

        //check which data changed
        if (req.body.detergentBrand) { getUserData.detergentUsage.detergentUsagePatterns.detergentBrand = req.body.detergentBrand };
        if (req.body.detergentType) { getUserData.detergentUsage.detergentUsagePatterns.detergentType = req.body.detergentType };
        if (req.body.currentLevel) { getUserData.detergentUsage.detergentUsagePatterns.currentLevel = req.body.currentLevel };
        if (req.body.averageUsagePerLoad) { getUserData.detergentUsage.detergentUsagePatterns.averageUsagePerLoad = req.body.averageUsagePerLoad };

        res
        .status(200)
        .json(getUserData);
    } else {
        res
            .status(404)
            .json({ error: "user not found" });
    }
})

//DELETE

function gatherInitialDetergentData(userId, detergentBrand, detergentType, currentLevel, averageUsagePerLoad) {
    // # Step 1: Ask the user to input their current detergent supply
    const detergentData = promptUserForDetergentData(detergentBrand, detergentType, currentLevel, averageUsagePerLoad);

    // # Step 2: Validate the input data
    if (validateDetergentData(detergentData)) {
        // # Step 3: Save the detergent data to the user's profile
        saveDetergentData(userId, detergentData);
        //update current user profile
        const usrProfileUpdate = userProfile.find((userProfile) => userProfile.userId == userId);
        usrProfileUpdate.detergentUsage.detergentUsagePatterns = detergentData;
        return { message: "Detergent data saved successfully", userId: userId };
    } else {
        return { error: "Invalid detergent data" };
    }
}

//prompt user detergent Data
function promptUserForDetergentData(detergentBrand, detergentType, currentLevel, averageUsagePerLoad) {
    //pull from form
    return {
        detergentBrand: detergentBrand,
        detergentType: detergentType,
        currentLevel: currentLevel, //measured in ltrs
        averageUsagePerLoad: averageUsagePerLoad, //measured in grams/liters
    };
}

//validate detergent data (nonEmpty)
function validateDetergentData(detergentData) {
    if (detergentData.currentLevel > 0 && detergentData.averageUsagePerLoad > 0) {
        return true;
    } else {
        return false;
    }
}

//save detergent data to user's profile
function saveDetergentData(userId, detergentData) {
    //store data in Postgress infc
}

//start server
app.listen(port, () => {
    console.log(`API is running fam, at http://localhost:${port}`);
});
