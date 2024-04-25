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

function setPopup(){
    const buttons = document.querySelectorAll('[data-order-popup]');
    buttons.forEach(button => {
        button.onclick = () => {
            const body = document.querySelector('body')
            const initialHtml = body.innerHTML;
            body.innerHTML += Popup2();

            const closeBtn = document.querySelector('[data-popup2-close]')
            console.log(closeBtn)
            closeBtn.onclick = () => {
                body.innerHTML = initialHtml
                setPopup();
            }
        }
    })
}

await showOrders();