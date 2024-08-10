const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", async (req, res) => {
  res.send("hello backend");
});

app.post("/saveProject", async (req, res) => {
  try {
    const { fname, lname, linkedin, github, twitter } = req.body.form;
    const showemail = req.body.showemail;
    const token = req.body.token;
    const numOfPro = req.body.numOfPro;
    const allImgID = req.body.allImgID;
    const bgColor = req.body.bgColor;
    const textColor = req.body.textColor;
    const ascColor = req.body.ascColor;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log(" all data in server ", req.body);
    // console.log(" decoded data is  ", decoded);


    const { data, e } = await supabase
      .from("project_basic_details")
      .select("*")
      .eq("email", decoded.email);

    if (data.length > 0) {
      await supabase
        .from("project_basic_details")
        .update({ fname, lname, showemail, linkedin, github, twitter,bgColor,textColor,ascColor })
        .eq("email", decoded.email);
    } else {
      await supabase.from("project_basic_details").insert({
        email: decoded.email,
        fname,
        lname,
        showemail,
        linkedin,
        github,
        twitter,
        bgColor,
        textColor,
        ascColor
      });
    }


    for (let i = 1; i <= numOfPro; i++) {
      const { data, e } = await supabase
        .from("projects")
        .select("*")
        .eq("email", decoded.email)
        .eq("pNum", i);

      if (data.length > 0) {
        console.log("ifff ")
        await supabase
        .from("projects")
        .update({
          pName: req.body.form[`pName${i}`],
          pDesc: req.body.form[`pDesc${i}`],
          pLink: req.body.form[`pLink${i}`],
          pGithub: req.body.form[`pGithub${i}`],
          imgID: allImgID[i-1],
        })
        .eq("email", decoded.email)
        .eq("pNum", i);
      } else {
          await supabase.from("projects").insert({
            email: decoded.email,
            pName: req.body.form[`pName${i}`],
            pDesc: req.body.form[`pDesc${i}`],
            pLink: req.body.form[`pLink${i}`],
            pGithub: req.body.form[`pGithub${i}`],
            pNum: i, 
            imgID: allImgID[i-1],
        });
      }
    }

    res.json({ success: true, msg: "Your ProjectVault is updated!" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.post("/checkForProject", async (req, res) => {
  try {
    const email = req.body.email;

    const { data, e } = await supabase
      .from("project_basic_details")
      .select("*")
      .eq("email", email);

    if (data.length > 0) {
      return res.json({ success: true, msg: "Project exist" });
    }

    res.json({ success: false, msg: "Project donot exist" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.post("/getProjectDetail", async (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded", decoded);
    const allDetails = {
      fname: "",
      lname: "",
      showemail: false,
      linkedin: "",
      github: "",
      twitter: "",
      projects: [],
    };

    const { data, e } = await supabase
      .from("project_basic_details")
      .select("*")
      .eq("email", decoded.email);

    // console.log(" project_basic_details data", data);

    if (data.length == 0) {
      return res.json({
        success: true,
        msg: "No data found",
        allDetails,
        found: false,
      });
    } else {
      allDetails.fname = data[0].fname;
      allDetails.lname = data[0].lname;
      allDetails.showemail = data[0].showemail;
      allDetails.linkedin = data[0].linkedin;
      allDetails.github = data[0].github;
      allDetails.twitter = data[0].twitter;

      const proData = await supabase
        .from("projects")
        .select("*")
        .eq("email", decoded.email);
      // allDetails.numOfPro=proData.length
      allDetails.projects = proData.data;

      return res.json({
        success: true,
        msg: "Data found",
        allDetails,
        found: true,
      });
    }

    // res.json({ success: true, msg: "Your ProjectVault is updated!" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.post("/getProjectDetailForPV", async (req, res) => {
  try {
    const email = req.body.email;
    const allDetails = {
      fname: "",
      lname: "",
      showemail: false,
      linkedin: "",
      github: "",
      twitter: "",
      projects: [],
    };

    const { data, e } = await supabase
      .from("project_basic_details")
      .select("*")
      .eq("email", email);

    allDetails.fname = data[0].fname;
    allDetails.lname = data[0].lname;
    allDetails.showemail = data[0].showemail;
    allDetails.linkedin = data[0].linkedin;
    allDetails.github = data[0].github;
    allDetails.twitter = data[0].twitter;
    allDetails.bgColor = data[0].bgColor;
    allDetails.textColor = data[0].textColor;
    allDetails.ascColor = data[0].ascColor;

    const proData = await supabase
      .from("projects")
      .select("*")
      .eq("email", email);
    // allDetails.numOfPro=proData.length
    allDetails.projects = proData.data;

    return res.json({ success: true, msg: "Data found", allDetails });

    // res.json({ success: true, msg: "Your ProjectVault is updated!" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.post("/adduser", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("name", name);
    console.log("email", email);
    console.log("password", password);

    const { data, e } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (data.length > 0) {
      return res.json({ success: false, msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await supabase
      .from("users")
      .insert({ name, email, password: hashedPassword });

    const token = jwt.sign({ name, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, msg: "User added successfully", token });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, e } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (data.length === 0) {
      console.log("hererererr");
      return res.json({ success: false, msg: "Email donot exist" });
    }

    const comparedPass = await bcrypt.compare(password, data[0].password);

    if (!comparedPass) {
      return res.json({ success: false, msg: "Incorrect password" });
    }

    const token = jwt.sign(
      { name: data[0].name, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, msg: "User loggedin successfully", token });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.post("/jwtverify", async (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      // console.log("decoded",decoded)
      return res.json({ success: true, msg: "verified", data: decoded });
    }

    //get data from token and check in db
    res.json({ success: false, msg: "not verified" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
