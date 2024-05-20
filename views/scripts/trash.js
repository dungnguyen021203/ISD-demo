const container = document.querySelector('.home-container');
import UserCards from '../components/UserCard.js';
import UserTrashCards from '../components/UserTrashCard.js';
import UserDetail from '../components/UserDetail.js';
import UserInfor from '../components/UserInfor.js';
import PopUp from '../components/popup.js';
import loadDashboard from './loadDash.js';
let body = document.querySelector('body');
async function loadUserMenu() {
    container.innerHTML = '';
    return new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/trash/menu');
        const users = await res.json();
        resolve(users);
    })
        .then((users) => {
            if  (users.isAdmin === "admin") {
                container.innerHTML = UserTrashCards({
                    users: users.customerTrashAdmin,
                    buttonTitle: 'Recovery',
                });
            } else {
                container.innerHTML = UserTrashCards({
                    users: users,
                    buttonTitle: 'Recovery',
                });
            }
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
                        type: 'Recovery',
                        title: 'Recovery',
                        desc:
                            'Recovery the customer(' +
                            userNode.dataset.name +
                            '). Customer will be add back to the home page. Are you sure?',
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
                            'http://localhost:8000/recovery/' + id,
                            {
                                method: 'put',
                            }
                        );

                        const data = await response.json();

                        window.location.assign(
                            'http://localhost:8000/trash'
                        );
                    };
                };
            });
        });
}

async function loadDetail({ id }) {
    return new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/details/' + id);
        const user = await res.json();
        resolve(user);
    })
        .then((user) => {
            container.innerHTML = UserDetail({ user, mode: 'trash' });
            return true;
        })
        .then(() => {
            const backButton = document.querySelector('.button-abc');
            backButton.onclick = async () => {
                await loadUserMenu();
            };
        });
}

await loadUserMenu();
await loadDashboard();