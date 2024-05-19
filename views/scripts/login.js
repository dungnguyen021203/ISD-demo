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

loginBtn.onclick = async (event) => {
    event.preventDefault();
    
    let isPassed = true;

    isPassed = validate({
        type: 'isRequired',
        value: username.value,
        message: 'The username must be not empty',
        inputNode: username,
    }) && isPassed;

    isPassed = validate({
        type: 'isRequired',
        value: password.value,
        message: 'The password must be not empty',
        inputNode: password,
    }) && isPassed;

    isPassed = validate({
        type: 'isMinLen',
        value: password.value,
        message: 'The password must have length of 6 at least',
        inputNode: password,
        min: 5,
    }) && isPassed;

    if (!isPassed) return;

    try {
        const res = await fetch(`http://localhost:8000/auth/login`, {
            method: 'post',
            body: JSON.stringify({
                username: username.value,
                password: password.value,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await res.json();

        if (res.status === 200) {
            window.location.assign("/pages/home.html");
        } else {
            const errorNode = qs('[data-auth-error]');
            errorNode.textContent = response.message;
        }
    } catch (error) {
        console.error('Error during login request:', error);
    }
};
