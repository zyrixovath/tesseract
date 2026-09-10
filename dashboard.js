/*
===============================================
CAMPUSPULSE DASHBOARD
===============================================
*/


/*
===============================================
USER DATA FROM GOOGLE LOGIN
===============================================
*/

const storedUser =
    sessionStorage.getItem("campusUser");


let campusUser = null;


if (storedUser) {

    try {

        campusUser =
            JSON.parse(storedUser);

    }

    catch (error) {

        console.error(
            "Could not read CampusPulse user:",
            error
        );

    }

}



/*
===============================================
HTML ELEMENTS
===============================================
*/

const userName =
    document.getElementById("userName");


const userEmail =
    document.getElementById("userEmail");


const userAvatar =
    document.getElementById("userAvatar");


const greeting =
    document.getElementById("greeting");


const userProfile =
    document.getElementById("userProfile");


const profileMenu =
    document.getElementById("profileMenu");


const logoutButton =
    document.getElementById("logoutButton");


const reportIssueButton =
    document.getElementById("reportIssueButton");


const reportModal =
    document.getElementById("reportModal");


const closeModal =
    document.getElementById("closeModal");


const issueForm =
    document.getElementById("issueForm");


const toast =
    document.getElementById("toast");



/*
===============================================
LOAD USER
===============================================
*/

if (campusUser) {


    if (campusUser.name) {

        userName.textContent =
            campusUser.name;

    }


    if (campusUser.email) {

        userEmail.textContent =
            campusUser.email;

    }


    if (campusUser.photo) {

        userAvatar.src =
            campusUser.photo;

    }

}



/*
===============================================
TIME-BASED GREETING
===============================================
*/

function setGreeting() {


    const hour =
        new Date().getHours();


    let text =
        "Good evening";


    if (hour < 12) {

        text =
            "Good morning";

    }

    else if (hour < 17) {

        text =
            "Good afternoon";

    }


    const firstName =
        campusUser &&
        campusUser.name
            ? campusUser.name.split(" ")[0]
            : "";


    if (firstName) {

        greeting.textContent =
            `${text}, ${firstName} 👋`;

    }

    else {

        greeting.textContent =
            `${text} 👋`;

    }

}


setGreeting();



/*
===============================================
PROFILE MENU
===============================================
*/

userProfile.addEventListener(
    "click",
    () => {

        profileMenu.classList.toggle(
            "show"
        );

    }
);


document.addEventListener(
    "click",
    event => {


        if (
            !userProfile.contains(event.target) &&
            !profileMenu.contains(event.target)
        ) {

            profileMenu.classList.remove(
                "show"
            );

        }

    }
);



/*
===============================================
SIGN OUT

For now this clears our stored session.

Later we will connect Firebase signOut here.
===============================================
*/

logoutButton.addEventListener(
    "click",
    () => {


        sessionStorage.removeItem(
            "campusUser"
        );


        window.location.href =
            "index.html";

    }
);



/*
===============================================
SIDEBAR NAVIGATION
===============================================
*/

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(item => {


    item.addEventListener(
        "click",
        () => {


            navItems.forEach(nav => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );


            const page =
                item.dataset.page;


            /*
            Report button opens modal.
            Other sections will become
            separate pages later.
            */

            if (page === "report") {

                openReportModal();

            }

        }
    );

});



/*
===============================================
FILTER ISSUES
===============================================
*/

const filterButtons =
    document.querySelectorAll(
        ".filter"
    );


const issueCards =
    document.querySelectorAll(
        ".issue-card"
    );


filterButtons.forEach(button => {


    button.addEventListener(
        "click",
        () => {


            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            const filter =
                button.dataset.filter;


            issueCards.forEach(card => {


                const categories =
                    card.dataset.category;


                if (
                    filter === "all" ||
                    categories.includes(filter)
                ) {

                    card.style.display =
                        "flex";

                }

                else {

                    card.style.display =
                        "none";

                }

            });

        }
    );

});



/*
===============================================
UPVOTES
===============================================
*/

const upvoteButtons =
    document.querySelectorAll(
        ".upvote-button"
    );


upvoteButtons.forEach(button => {


    button.addEventListener(
        "click",
        () => {


            const countElement =
                button.querySelector(
                    ".vote-count"
                );


            let count =
                Number(
                    countElement.textContent
                );


            if (
                button.classList.contains(
                    "voted"
                )
            ) {


                count--;

                button.classList.remove(
                    "voted"
                );

            }

            else {


                count++;

                button.classList.add(
                    "voted"
                );

            }


            countElement.textContent =
                count;

        }
    );

});



/*
===============================================
REPORT ISSUE MODAL
===============================================
*/

function openReportModal() {

    reportModal.classList.add(
        "show"
    );

}


function closeReportModal() {

    reportModal.classList.remove(
        "show"
    );

}


reportIssueButton.addEventListener(
    "click",
    openReportModal
);


closeModal.addEventListener(
    "click",
    closeReportModal
);


reportModal.addEventListener(
    "click",
    event => {


        if (
            event.target === reportModal
        ) {

            closeReportModal();

        }

    }
);



/*
===============================================
SEVERITY SELECTOR
===============================================
*/

let selectedSeverity =
    "low";


const severityOptions =
    document.querySelectorAll(
        ".severity-option"
    );


severityOptions.forEach(option => {


    option.addEventListener(
        "click",
        () => {


            severityOptions.forEach(btn => {

                btn.classList.remove(
                    "selected"
                );

            });


            option.classList.add(
                "selected"
            );


            selectedSeverity =
                option.dataset.severity;

        }
    );

});



/*
===============================================
SUBMIT NEW ISSUE
===============================================
*/

issueForm.addEventListener(
    "submit",
    event => {


        event.preventDefault();



        const title =
            document
                .getElementById(
                    "issueTitle"
                )
                .value
                .trim();


        const category =
            document
                .getElementById(
                    "issueCategory"
                )
                .value;


        const location =
            document
                .getElementById(
                    "issueLocation"
                )
                .value;


        const description =
            document
                .getElementById(
                    "issueDescription"
                )
                .value
                .trim();



        if (
            !title ||
            !category ||
            !location ||
            !description
        ) {

            return;

        }



        /*
        Create new issue object.

        Later this will be sent to Flask /
        Firebase / database.
        */

        const newIssue = {

            title:
                title,

            category:
                category,

            location:
                location,

            description:
                description,

            severity:
                selectedSeverity,

            reportedBy:
                campusUser
                    ? campusUser.email
                    : "anonymous",

            timestamp:
                new Date().toISOString()

        };


        console.log(
            "New CampusPulse issue:",
            newIssue
        );



        /*
        Add issue visually to dashboard
        */

        addIssueToDashboard(
            newIssue
        );



        /*
        Reset form
        */

        issueForm.reset();


        selectedSeverity =
            "low";


        severityOptions.forEach(
            option => {

                option.classList.remove(
                    "selected"
                );

            }
        );


        severityOptions[0]
            .classList.add(
                "selected"
            );



        closeReportModal();


        showToast(
            "Issue submitted successfully."
        );

    }
);



/*
===============================================
ADD ISSUE TO DASHBOARD
===============================================
*/

function addIssueToDashboard(
    issue
) {


    const issueList =
        document.getElementById(
            "issueList"
        );



    const card =
        document.createElement(
            "article"
        );


    card.className =
        "issue-card";


    card.dataset.category =
        issue.category
            .toLowerCase();



    let severityClass =
        "low";


    let severityTag =
        "low-tag";


    if (
        issue.severity ===
        "moderate"
    ) {

        severityClass =
            "medium";

        severityTag =
            "medium-tag";

    }


    if (
        issue.severity ===
        "critical"
    ) {

        severityClass =
            "critical";

        severityTag =
            "critical-tag";

    }



    card.innerHTML = `

        <div
            class="severity-line ${severityClass}"
        ></div>

        <div class="issue-content">

            <div class="issue-header">

                <div>

                    <div class="issue-tags">

                        <span
                            class="tag ${severityTag}"
                        >
                            ${issue.severity.toUpperCase()}
                        </span>

                        <span class="tag">
                            ${issue.category.toUpperCase()}
                        </span>

                    </div>

                    <h4>
                        ${escapeHTML(issue.title)}
                    </h4>

                </div>

                <button
                    class="upvote-button"
                >

                    <span>
                        ▲
                    </span>

                    <span
                        class="vote-count"
                    >
                        0
                    </span>

                </button>

            </div>

            <p>
                ${escapeHTML(
                    issue.description
                )}
            </p>

            <div class="issue-meta">

                <span>
                    📍 ${escapeHTML(
                        issue.location
                    )}
                </span>

                <span>
                    ◷ Just now
                </span>

                <span>
                    👥 1 report
                </span>

            </div>

        </div>

    `;



    issueList.prepend(
        card
    );



    /*
    Add voting functionality
    to newly created issue.
    */

    const voteButton =
        card.querySelector(
            ".upvote-button"
        );


    voteButton.addEventListener(
        "click",
        () => {


            const count =
                voteButton.querySelector(
                    ".vote-count"
                );


            if (
                voteButton.classList.contains(
                    "voted"
                )
            ) {

                count.textContent =
                    Number(
                        count.textContent
                    ) - 1;


                voteButton.classList.remove(
                    "voted"
                );

            }

            else {

                count.textContent =
                    Number(
                        count.textContent
                    ) + 1;


                voteButton.classList.add(
                    "voted"
                );

            }

        }
    );

}



/*
===============================================
TOAST
===============================================
*/

function showToast(
    message
) {


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },

        2500
    );

}



/*
===============================================
HTML SAFETY
===============================================
*/

function escapeHTML(
    text
) {


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}