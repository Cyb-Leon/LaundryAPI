import express from "express";
import bodyParser from "body-parser";

//server
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
        "userId": users.find(0),
        "laundryPreferences": laundryInfo.find(0),
        "detergentUsagePattern": detergentInfo.find(0)
    },
    {
        "userId": users.find(1),
        "laundryPreferences": laundryInfo.find(1),
        "detergentUsagePattern": detergentInfo.find(1)
    },
    {
        "userId": users.find(2),
        "laundryPreferences": laundryInfo.find(2),
        "detergentUsagePattern": detergentInfo.find(2)
    },
];

//routes
//Post /user/register
app.post("/user/register", (req, res) => {
    //pull from server/form
    const userData = req.body; //json for in-memory database
    //# Step 1: Validate the user's input data (e.g., email, password, etc.)
    if (validateUserData(userData) != false) {
        // # Step 2: Save user data to the database
        const userId = saveUserToDatabase(userData);

        // # Step 3: Initialize user profile with default preferences
        initializeUserProfile(userId);

        return { message: "User registered successfully", userId: userId };
    } else {
        return { error: "Invalid user data" };
    }
});

//function for validating user credentials
function validateUserData(userData) {
    if (userData.email && userData.password) {
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
        userId: users.length,
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
    })
    return (users.length - 1);
}

//function for initialize user profile
function initializeUserProfile(userId) {
    profileData = {
        userId: userId,
        laundryPreferences: {},
        detergentUsagePatterns: {},
    };

    saveProfileToDatabase(profileData);
}

//function to saveProfileToDatabase
function saveProfileToDatabase(profileData) {
    //logic to save profile data on Postgress
    //in-memory storage
    userProfile.push(profileData);
}

//get initial data of the laundry
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
        return True;
    }
    return False;
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
function gatherInitialDetergentData(userId, detergentBrand, detergentType, currentLevel, averageUsagePerLoad) {
    // # Step 1: Ask the user to input their current detergent supply
    const detergentData = promptUserForDetergentData(detergentBrand, detergentType, currentLevel, averageUsagePerLoad);

    // # Step 2: Validate the input data
    if (validateDetergentData(detergentData)) {
        // # Step 3: Save the detergent data to the user's profile
        saveDetergentData(userId, detergentData);

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
