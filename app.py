from flask import Flask, jsonify, request
from flask_cors import CORS

import firebase_admin

from firebase_admin import credentials
from firebase_admin import auth

import os



# =====================================================
# FLASK APP
# =====================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)



# =====================================================
# FIREBASE ADMIN SETUP
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


SERVICE_ACCOUNT_PATH = os.path.join(
    BASE_DIR,
    "serviceAccountKey.json"
)



if not firebase_admin._apps:

    cred = credentials.Certificate(
        SERVICE_ACCOUNT_PATH
    )

    firebase_admin.initialize_app(
        cred
    )



# =====================================================
# ADMIN ACCOUNTS
# =====================================================

ADMIN_EMAILS = [

    "aditya.26bce10029@vitbhopal.ac.in"

]



# =====================================================
# HOME ROUTE
# =====================================================

@app.route("/")
def home():

    return jsonify({

        "success": True,

        "message":
            "CampusPulse backend is running!"

    })



# =====================================================
# GOOGLE / FIREBASE LOGIN
# =====================================================

@app.route(
    "/api/auth/google",
    methods=["POST"]
)
def google_login():


    try:


        # ---------------------------------------------
        # READ REQUEST
        # ---------------------------------------------

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify({

                "success": False,

                "message":
                    "Invalid request."

            }), 400



        token = data.get(
            "token"
        )


        requested_role = data.get(
            "role"
        )



        # ---------------------------------------------
        # TOKEN CHECK
        # ---------------------------------------------

        if not token:

            return jsonify({

                "success": False,

                "message":
                    "Authentication token missing."

            }), 400



        if requested_role not in [
            "student",
            "admin"
        ]:

            return jsonify({

                "success": False,

                "message":
                    "Invalid account role."

            }), 400



        # ---------------------------------------------
        # VERIFY FIREBASE TOKEN
        # ---------------------------------------------

        decoded_token = (
            auth.verify_id_token(
                token
            )
        )



        uid = decoded_token.get(
            "uid"
        )


        email = (
            decoded_token
            .get("email", "")
            .lower()
            .strip()
        )


        name = decoded_token.get(
            "name",
            ""
        )


        photo = decoded_token.get(
            "picture",
            ""
        )



        # ---------------------------------------------
        # EMAIL CHECK
        # ---------------------------------------------

        if not email:

            return jsonify({

                "success": False,

                "message":
                    "Google account email could not be verified."

            }), 401



        # ---------------------------------------------
        # VIT BHOPAL DOMAIN CHECK
        # ---------------------------------------------

        if not email.endswith(
            "@vitbhopal.ac.in"
        ):

            return jsonify({

                "success": False,

                "message":
                    "Please use your official VIT Bhopal account."

            }), 403



        # ---------------------------------------------
        # ADMIN CHECK
        # ---------------------------------------------

        if requested_role == "admin":

            if email not in ADMIN_EMAILS:

                return jsonify({

                    "success": False,

                    "message":
                        "This account is not authorized as a CampusPulse administrator."

                }), 403



        # ---------------------------------------------
        # USER DATA
        # ---------------------------------------------

        user_data = {

            "uid":
                uid,

            "name":
                name or "CampusPulse User",

            "email":
                email,

            "photo":
                photo,

            "role":
                requested_role

        }



        # ---------------------------------------------
        # SUCCESS
        # ---------------------------------------------

        return jsonify({

            "success": True,

            "message":
                "Authentication successful.",

            "user":
                user_data

        }), 200



    except firebase_admin.auth.InvalidIdTokenError:


        return jsonify({

            "success": False,

            "message":
                "Invalid authentication token."

        }), 401



    except firebase_admin.auth.ExpiredIdTokenError:


        return jsonify({

            "success": False,

            "message":
                "Your login session has expired. Please sign in again."

        }), 401



    except Exception as error:


        print(
            "LOGIN ERROR:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                "Server authentication failed."

        }), 500



# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )