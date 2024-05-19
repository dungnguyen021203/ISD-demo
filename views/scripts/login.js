const qs = document.querySelector.bind(document);

const loginBtn = qs('.form-submit');
const username = qs('[data-username]');
const password = qs('[data-password]');

const showError = ({ inputNode, message }) => {
    const parent = inputNode.closest('.form-group');
    const errorNode = parent.querySelector('.form-error');
    errorNode.textContent = message;
};

const hiddenError = ({ inputNode }) => {
    const parent = inputNode.closest('.form-group');
    const errorNode = parent.querySelector('.form-error');
    errorNode.textContent = '';
};

const validate = ({ type, value, min, inputNode, message }) => {
    if (type === 'isEmail') {
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value)) {
            showError({
                inputNode,
                message,
            });
            return false;
        } else {
            hiddenError({
                inputNode,
            });
            return true;
        }
    }

    if (type === 'isRequired') {
        if (value && value.trim() !== '') {
            hiddenError({
                inputNode,
            });
            return true;
        } else {
            showError({
                inputNode,
                message,
            });
            return false;
        }
    }

    if (type === 'isMinLen') {
        if (value && value.length >= min) {
            hiddenError({
                inputNode,
            });
            return true;
        } else {
            showError({
                inputNode,
                message,
            });
            return false;
        }
    }
};

const hiddenErrors = () => {
    const errorNodes = document.querySelectorAll('.form-error');
    errorNodes.forEach((errorNode) => (errorNode.textContent = ''));
};

loginBtn.onclick = async () => {
    let isPassed = true;
    /**
     * Validations
     */
    isPassed = validate({
        type: 'isRequired',
        value: username.value,
        message: 'The username must be not empty',
        inputNode: username,
    });

    isPassed = validate({
        type: 'isRequired',
        value: password.value,
        message: 'The password must be not empty',
        inputNode: password,
    });

    isPassed = validate({
        type: 'isMinLen',
        value: password.value,
        message: 'The password must have length of 8 at least',
        inputNode: password,
        min: 5,
    });

    if (!isPassed) return;

    /**
     * Send request
     */
    const res = await fetch(`http://localhost:8000/auth/login`, {
        method: 'post',
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    }).catch((error) => console.log(error));
    const users = await res.json();
    console.log(users);

    const errorNode = qs('[data-auth-error]');
    if (!users[0]) {
        errorNode.textContent = 'Email or password is wrong';
        return;
    }

    errorNode.textContent = '';
    qs('body').innerHTML = '...loading';
    setTimeout(() => {
        window.location.assign('/pages/home.html');
    }, 2000);
};
