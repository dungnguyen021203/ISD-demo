const container = document.querySelector('.home-container');
import UserCards from '../components/UserCard.js';
import UserDetail from '../components/UserDetail.js';
import UserInfor from '../components/UserInfor.js';
import PopUp from '../components/popup.js';
const addUser = document.querySelector('[data-add-user]');
let body = document.querySelector('body');
async function loadUserMenu() {
    const container = document.querySelector('.home-container');
    container.innerHTML = '';
    return new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/home');
        const users = await res.json();
        resolve(users);
    })
        .then((users) => {
            container.innerHTML = UserCards({ users: users });
        })
        .then(() => {
            const userNodes = document.querySelectorAll('.customer-card');
            userNodes.forEach((userNode) => {
                const button = userNode.querySelector('[data-button');
                const id = button.dataset.id;

                const removeButton =
                    userNode.querySelector('[data-remove]');

                button.onclick = async () => {
                    await loadDetail({ id });
                };

                removeButton.onclick = async () => {
                    const initialHTML = body.innerHTML;
                    body.innerHTML += PopUp({
                        link: false,
                        isAdd: false,
                        hasClose: true,
                        ctinue: false,
                        type: 'Delete',
                        title: 'Delete',
                        desc:
                            'Delete the customer(' +
                            userNode.dataset.name +
                            ').Customers in the trash will be permanently deleted after 30 days',
                    });

                    const closeBtn = document.querySelector(
                        '[data-popup-close]'
                    );
                    const okBtn = document.querySelector('[data-ok]');
                    const cancelBtn =
                        document.querySelector('[data-cancel]');
                    closeBtn.onclick = cancelBtn.onclick = async () => {
                        body.innerHTML = initialHTML;
                        await loadUserMenu();
                    };

                    okBtn.onclick = async () => {
                        const response = await fetch(
                            'http://localhost:8000/delete/' + id,
                            {
                                method: 'delete',
                            }
                        );

                        const data = await response.json();

                        window.location.assign('http://localhost:8000/');
                    };
                };
            });
        });
}

async function loadDetail({ id }) {
    localStorage.setItem('user_id', id);
    return new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/details/' + id);
        const user = await res.json();
        localStorage.setItem('user', JSON.stringify(user));
        resolve(user);
    })
        .then((user) => {
            const container = document.querySelector('.home-container');
            container.innerHTML = UserDetail({ user });
            return true;
        })
        .then(() => {
            const backtoMenuButton = document.querySelector('[data-menu-back]');
            const editButton = document.querySelector(
                '[data-edit-detail]'
            );
            backtoMenuButton.onclick = async () => {
                await loadUserMenu();
            };

            editButton.onclick = () => {
                loadUserForm({ mode: 'edit' });
            };
        });
}

function loadUserForm({ mode = 'add' }) {

    const container = document.querySelector('.home-container');
    let initialHTML = body.innerHTML;
    container.innerHTML = UserInfor();

    if (mode === 'edit') {
        const curUser = JSON.parse(localStorage.getItem('user')).customer;
        const name = container.querySelector('[data-name]');
        name.value = curUser.customer_name;
        const email = container.querySelector('[data-email]');
        email.value = curUser.customer_email;
        const phone = container.querySelector('[data-phone]');
        phone.value = curUser.customer_phoneNumber;
        const cc = container.querySelector('[data-cc]');
        cc.value = curUser.customer_citizenID;
        const type = container.querySelector('[data-type]');
        type.value = 'Individual';

    }
    const backButton = container.querySelector('[data-back]');
    const confirmButton = container.querySelector('[data-confirm]');


    backButton.onclick = async () => {
        if (mode === 'add') {
            await loadUserMenu();
        } else {
            await loadDetail({
                id: localStorage.getItem('user_id'),
            });
        }
    };

    /* Send form */
    const user = JSON.parse(localStorage.getItem('user'));
    confirmButton.onclick = async () => {
        const formSubmittedSuccessfully = await sendForm({
            url:
                mode == 'edit'
                    ? `http://localhost:8000/update/${user.customer.customer_id}`
                    : 'http://localhost:8000/auth',
            method: mode == 'edit' ? 'PATCH' : 'POST',
        });
        if (formSubmittedSuccessfully) {
            const successMessage = mode === 'edit'
            ? {
                title: 'Update Successful',
                desc: 'The customer details have been updated successfully.',
                type: 'Update'
            }
            : {
                title: 'Addition Successful',
                desc: 'A new customer has been added successfully.',
                type: 'Add',
                link: true,
                isAdd: true,
                ctinue: false,
            };

            const popUpHtml = PopUp(successMessage);
            body.innerHTML += popUpHtml;

            const closeBtn = document.querySelector(
                '[data-back-to-detail]'
            );

            closeBtn.onclick = async () => {
                body.innerHTML = initialHTML;
                const container =
                    document.querySelector('.home-container');
                container.innerHTML = '';
                await loadDetail({
                    id: JSON.parse(localStorage.getItem('user')).customer
                        .customer_id,
                });
            };

        } else {
            const popUpFalse = PopUp({
                title: 'Error',
                desc: 'All fields must be filled out correctly. Please check again',
                type: 'Error',
                hasClose: true,
                isAdd: false,
                ctinue: false,
            });

            body.innerHTML += popUpFalse;

            const closeBtn = document.querySelector('[data-popup-close]');
            const okBtn = document.querySelector('[data-ok]');
            const cancelBtn = document.querySelector('[data-cancel]');
            closeBtn.onclick = async () => {
                body.innerHTML = initialHTML;

                loadUserForm({ mode: 'add' });

                const backButton = document.querySelector('[data-back]');
                backButton.onclick = async() => {
                    if (mode === 'add') {
                        await loadUserMenu();
                    } else {
                        await loadDetail({
                            id: localStorage.getItem('user_id'),
                        });
                    }
                }
            };
            okBtn.onclick = async () => {
                body.innerHTML = initialHTML;
                loadUserForm({ mode: 'add' });

                const backButton = document.querySelector('[data-back]');
                backButton.onclick = async() => {
                    if (mode === 'add') {
                        await loadUserMenu();
                    } else {
                        await loadDetail({
                            id: localStorage.getItem('user_id'),
                        });
                    }
                }
            };
            cancelBtn.onclick = async () => {
                body.innerHTML = initialHTML;
                loadUserForm({ mode: 'add' });

                const backButton = document.querySelector('[data-back]');
                backButton.onclick = async() => {
                    if (mode === 'add') {
                        await loadUserMenu();
                    } else {
                        await loadDetail({
                            id: localStorage.getItem('user_id'),
                        });
                    }
                }
            };


        }
    };
}

async function sendForm({
    url = 'http://localhost:8000/auth',
    method = 'POST',
}) {
    const name = document.querySelector('[data-name]');
    const email = document.querySelector('[data-email]');
    const phone = document.querySelector('[data-phone]');
    const cc = document.querySelector('[data-cc]');
    const type = document.querySelector('[data-type]');

    // Email validation pattern
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    // Check if any field is empty or if email does not match the pattern
    if (!name.value || !phone.value || !cc.value || !type.value ||
        !email.value || !emailPattern.test(email.value)) {
        console.error('Validation failed: All fields must be filled correctly.');
        return false;
    }


    try {
        const response = await fetch(url, {
            method,
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                phone: phone.value,
                cc: cc.value,
                type: type.value,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Server responded with an error.');
        }
        return true;
    } catch (error) {
        console.log(error);
        console.error('Failed to submit form:', error);
        return false;
    }
}

await loadUserMenu();
addUser.onclick = () => loadUserForm({ mode: 'add' });