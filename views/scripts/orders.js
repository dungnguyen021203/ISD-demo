import Orders from "../components/order.js";
import Popup2 from "../components/popup2.js"

const getOrders = async() => {
    const res = await fetch('/customerOrders/1', {method: 'GET'});
    const orders = await res.json();
    localStorage.setItem('orders', JSON.stringify(orders))

    return orders
}


async function showOrders(){
    const orderMenu = document.querySelector('.orders-list');
    orderMenu.innerHTML = Orders({orders: await getOrders()})
    setPopup();
}

function setPopup() {
    const buttons = document.querySelectorAll('[data-order-popup]');
    buttons.forEach(button => {
        button.onclick = () => {
            const orderId = button.getAttribute('data-order-id');
            const orders = JSON.parse(localStorage.getItem('orders'));
            const order = orders.find(o => o.order_id.toString() === orderId);

            const body = document.querySelector('body');
            const initialHtml = body.innerHTML;
            body.innerHTML += Popup2(order);

            const closeBtn = document.querySelector('[data-popup2-close]');
            closeBtn.onclick = () => {
                body.innerHTML = initialHtml;
                setPopup();
            };
        };
    });
}

await showOrders();