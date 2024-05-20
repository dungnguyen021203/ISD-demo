async function loadDashboard () {
    return new Promise(async (resolve, reject) => {
        const res = await fetch('http://localhost:8000/dashboard');
        const users = await res.json();
        resolve(users);
    })
        .then((users) => {
            if (users.isAdmin === "admin"){
                document.querySelectorAll('.admin-only').forEach(element => element.style.display = 'block');
            } else {
                document.querySelectorAll('.admin-only').forEach(element => element.style.display = 'none');
            }
        })
    }

export default loadDashboard;