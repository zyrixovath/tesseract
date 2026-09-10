import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyDZgiWEtHrOKQosV2WfPLR82s_iAp8ze5Y",

    authDomain: "campuspulse-73544.firebaseapp.com",

    projectId: "campuspulse-73544",

    storageBucket: "campuspulse-73544.firebasestorage.app",

    messagingSenderId: "963558588008",

    appId: "1:963558588008:web:4ca67e4cd83326e18ac5dd",

    measurementId: "G-2PR9CP64Q9"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);



/* =====================================================
   ADMIN ACCOUNTS
===================================================== */

const ADMIN_EMAILS = [

    "aditya.26bce10029@vitbhopal.ac.in"

    // Add other admin emails here:
    // ,"anotheradmin@vitbhopal.ac.in"

];



/* =====================================================
   GOOGLE PROVIDER
===================================================== */

const provider = new GoogleAuthProvider();


provider.setCustomParameters({

    hd: "vitbhopal.ac.in",

    prompt: "select_account"

});



/* =====================================================
   ELEMENTS
===================================================== */

const studentRole =
    document.getElementById("studentRole");


const adminRole =
    document.getElementById("adminRole");


const googleLogin =
    document.getElementById("googleLogin");


const googleButtonText =
    document.getElementById("googleButtonText");


const loginMessage =
    document.getElementById("loginMessage");


const selectedTitle =
    document.getElementById("selectedTitle");


const selectedDescription =
    document.getElementById("selectedDescription");


const infoIcon =
    document.querySelector(".info-icon");



/* =====================================================
   DEFAULT ROLE
===================================================== */

let selectedRole = "student";


console.log("Default role:", selectedRole);



/* =====================================================
   SELECT STUDENT
===================================================== */

studentRole.addEventListener("click", () => {

    selectedRole = "student";

    console.log("Selected role:", selectedRole);


    studentRole.classList.add("active");

    adminRole.classList.remove("active");


    googleButtonText.textContent =
        "Continue as Student with Google";


    selectedTitle.textContent =
        "Student Access";


    selectedDescription.textContent =
        "Submit complaints, track their status and view your complaint history.";


    infoIcon.textContent =
        "🎓";


    loginMessage.textContent = "";

});



/* =====================================================
   SELECT ADMIN
===================================================== */

adminRole.addEventListener("click", () => {

    selectedRole = "admin";

    console.log("Selected role:", selectedRole);


    adminRole.classList.add("active");

    studentRole.classList.remove("active");


    googleButtonText.textContent =
        "Continue as Administrator with Google";


    selectedTitle.textContent =
        "Administrator Access";


    selectedDescription.textContent =
        "View campus-wide complaints, analytics and manage complaint status.";


    infoIcon.textContent =
        "🛡";


    loginMessage.textContent = "";

});



/* =====================================================
   GOOGLE LOGIN
===================================================== */

googleLogin.addEventListener("click", async () => {


    console.log("Login requested as:", selectedRole);


    try {


        googleLogin.disabled = true;


        loginMessage.style.color = "#91a1b6";

        loginMessage.textContent =
            "Opening Google sign-in...";



        /* GOOGLE LOGIN */

        const result =
            await signInWithPopup(
                auth,
                provider
            );


        const user =
            result.user;


        const email =
            (user.email || "")
                .toLowerCase()
                .trim();



        console.log("Google login successful");

        console.log("Email:", email);

        console.log("Requested role:", selectedRole);



        /* =================================================
           DOMAIN CHECK
        ================================================= */

        if (
            !email.endsWith(
                "@vitbhopal.ac.in"
            )
        ) {


            console.log(
                "Rejected: not a VIT Bhopal email"
            );


            await signOut(auth);


            showError(
                "Please sign in using your official VIT Bhopal account."
            );


            return;

        }



        /* =================================================
           STUDENT LOGIN
        ================================================= */

        if (
            selectedRole === "student"
        ) {


            console.log(
                "STUDENT LOGIN ACCEPTED"
            );



            const studentData = {

                uid: user.uid,

                name:
                    user.displayName ||
                    "Student",

                email:
                    user.email,

                photo:
                    user.photoURL,

                role:
                    "student"

            };



            sessionStorage.setItem(

                "campusUser",

                JSON.stringify(
                    studentData
                )

            );



            console.log(
                "Student data stored:",
                studentData
            );


            loginMessage.style.color =
                "#49dfa6";


            loginMessage.textContent =
                `Welcome ${getFirstName(user.displayName)}! Opening student portal...`;



            /*
            IMPORTANT:
            THIS MUST MATCH THE EXACT FILE NAME
            */

            setTimeout(() => {

                console.log(
                    "Redirecting to student-dashboard.html"
                );


                window.location.href =
                    "./student-dashboard.html";

            }, 500);


            return;

        }



        /* =================================================
           ADMIN LOGIN
        ================================================= */

        if (
            selectedRole === "admin"
        ) {


            console.log(
                "Checking administrator permissions..."
            );



            if (
                !ADMIN_EMAILS.includes(
                    email
                )
            ) {


                console.log(
                    "ADMIN ACCESS DENIED"
                );


                await signOut(auth);


                showError(
                    "This VIT Bhopal account is not authorized as an administrator."
                );


                return;

            }



            console.log(
                "ADMIN LOGIN ACCEPTED"
            );



            const adminData = {

                uid:
                    user.uid,

                name:
                    user.displayName ||
                    "Administrator",

                email:
                    user.email,

                photo:
                    user.photoURL,

                role:
                    "admin"

            };



            sessionStorage.setItem(

                "campusUser",

                JSON.stringify(
                    adminData
                )

            );



            loginMessage.style.color =
                "#49dfa6";


            loginMessage.textContent =
                `Welcome Administrator ${getFirstName(user.displayName)}!`;



            setTimeout(() => {


                window.location.href =
                    "./dashboard.html";


            }, 500);


            return;

        }


    }


    catch (error) {


        console.error(
            "CAMPUSPULSE LOGIN ERROR:",
            error
        );


        console.error(
            "Error code:",
            error.code
        );


        console.error(
            "Error message:",
            error.message
        );


        googleLogin.disabled =
            false;



        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {


            loginMessage.style.color =
                "#91a1b6";


            loginMessage.textContent =
                "Google sign-in cancelled.";


            return;

        }



        if (
            error.code ===
            "auth/popup-blocked"
        ) {


            showError(
                "Google sign-in popup was blocked. Please allow popups."
            );


            return;

        }



        if (
            error.code ===
            "auth/unauthorized-domain"
        ) {


            showError(
                "This domain is not authorized in Firebase."
            );


            return;

        }



        showError(
            "Login failed. Check the browser console for the exact error."
        );


    }


});



/* =====================================================
   ERROR MESSAGE
===================================================== */

function showError(message) {


    googleLogin.disabled =
        false;


    loginMessage.style.color =
        "#ff6674";


    loginMessage.textContent =
        message;

}



/* =====================================================
   FIRST NAME
===================================================== */

function getFirstName(name) {


    if (!name) {

        return "Student";

    }


    return name
        .trim()
        .split(" ")[0];

}