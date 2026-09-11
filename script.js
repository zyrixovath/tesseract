import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


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



/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);



/* =====================================================
   FLASK BACKEND
===================================================== */

const BACKEND_URL =
    "http://127.0.0.1:5000";



/* =====================================================
   GOOGLE PROVIDER
===================================================== */

const provider =
    new GoogleAuthProvider();


provider.setCustomParameters({

    hd: "vitbhopal.ac.in",

    prompt: "select_account"

});



/* =====================================================
   PAGE ELEMENTS
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
    document.getElementById(
        "selectedDescription"
    );


const infoIcon =
    document.querySelector(".info-icon");



/* =====================================================
   DEFAULT ROLE
===================================================== */

let selectedRole =
    "student";



/* =====================================================
   SELECT STUDENT
===================================================== */

studentRole.addEventListener(
    "click",
    () => {

        selectedRole =
            "student";


        studentRole.classList.add(
            "active"
        );


        adminRole.classList.remove(
            "active"
        );


        googleButtonText.textContent =
            "Continue as Student with Google";


        selectedTitle.textContent =
            "Student Access";


        selectedDescription.textContent =
            "Submit complaints, track their status and view your complaint history.";


        infoIcon.textContent =
            "🎓";


        clearMessage();

    }
);



/* =====================================================
   SELECT ADMIN
===================================================== */

adminRole.addEventListener(
    "click",
    () => {

        selectedRole =
            "admin";


        adminRole.classList.add(
            "active"
        );


        studentRole.classList.remove(
            "active"
        );


        googleButtonText.textContent =
            "Continue as Administrator with Google";


        selectedTitle.textContent =
            "Administrator Access";


        selectedDescription.textContent =
            "View campus-wide complaints, analytics and manage complaint status.";


        infoIcon.textContent =
            "🛡";


        clearMessage();

    }
);



/* =====================================================
   GOOGLE LOGIN
===================================================== */

googleLogin.addEventListener(
    "click",
    async () => {


        try {


            googleLogin.disabled =
                true;


            showMessage(
                "Opening Google sign-in...",
                "#91a1b6"
            );



            /* =========================================
               FIREBASE GOOGLE LOGIN
            ========================================== */

            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const user =
                result.user;



            /* =========================================
               GET FIREBASE TOKEN
            ========================================== */

            const idToken =
                await user.getIdToken();



            showMessage(
                "Verifying your account with CampusPulse...",
                "#91a1b6"
            );



            /* =========================================
               SEND TOKEN TO FLASK
            ========================================== */

            const response =
                await fetch(
                    `${BACKEND_URL}/api/auth/google`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            token:
                                idToken,

                            role:
                                selectedRole

                        })

                    }
                );



            const data =
                await response.json();



            /* =========================================
               BACKEND REJECTED LOGIN
            ========================================== */

            if (!response.ok) {


                await signOut(auth);


                throw new Error(
                    data.message ||
                    "Login was rejected."
                );

            }



            /* =========================================
               LOGIN SUCCESSFUL
            ========================================== */

            const campusUser = {

                uid:
                    data.user.uid,

                name:
                    data.user.name,

                email:
                    data.user.email,

                photo:
                    data.user.photo,

                role:
                    data.user.role

            };



            sessionStorage.setItem(

                "campusUser",

                JSON.stringify(
                    campusUser
                )

            );



            showMessage(
                `Welcome ${getFirstName(campusUser.name)}!`,
                "#49dfa6"
            );



            /* =========================================
               STUDENT REDIRECT
            ========================================== */

            if (
                campusUser.role ===
                "student"
            ) {


                setTimeout(
                    () => {

                        window.location.href =
                            "./student-dashboard.html";

                    },
                    600
                );


                return;

            }



            /* =========================================
               ADMIN REDIRECT
            ========================================== */

            if (
                campusUser.role ===
                "admin"
            ) {


                setTimeout(
                    () => {

                        window.location.href =
                            "./dashboard.html";

                    },
                    600
                );


                return;

            }


        }


        catch (error) {


            console.error(
                "CampusPulse login error:",
                error
            );


            googleLogin.disabled =
                false;



            /* POPUP CLOSED */

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {


                showMessage(
                    "Google sign-in cancelled.",
                    "#91a1b6"
                );


                return;

            }



            /* POPUP BLOCKED */

            if (
                error.code ===
                "auth/popup-blocked"
            ) {


                showError(
                    "Google sign-in popup was blocked. Please allow popups."
                );


                return;

            }



            /* FIREBASE DOMAIN ERROR */

            if (
                error.code ===
                "auth/unauthorized-domain"
            ) {


                showError(
                    "This website is not authorized in Firebase Authentication."
                );


                return;

            }



            /* BACKEND CONNECTION ERROR */

            if (
                error instanceof TypeError
            ) {


                showError(
                    "CampusPulse backend is not running. Start Flask and try again."
                );


                return;

            }



            /* OTHER ERROR */

            showError(
                error.message ||
                "Login failed."
            );


        }


    }
);



/* =====================================================
   SHOW NORMAL MESSAGE
===================================================== */

function showMessage(
    message,
    color
) {


    loginMessage.style.color =
        color;


    loginMessage.textContent =
        message;

}



/* =====================================================
   SHOW ERROR
===================================================== */

function showError(
    message
) {


    googleLogin.disabled =
        false;


    loginMessage.style.color =
        "#ff6674";


    loginMessage.textContent =
        message;

}



/* =====================================================
   CLEAR MESSAGE
===================================================== */

function clearMessage() {


    loginMessage.textContent =
        "";

}



/* =====================================================
   FIRST NAME
===================================================== */

function getFirstName(
    name
) {


    if (!name) {

        return "Student";

    }


    return name
        .trim()
        .split(" ")[0];

}