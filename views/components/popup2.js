function Popup2(order) {
    return `
        <div class="popup" id="popup">
            <div class="popup-inner">
                <div class="popup__text">
                    <h1>Order Details</h1>
                    <p>Order Code: #${order.order_code}</p>
                    <p>Order Time: ${order.order_buyDate}</p>
                    <p>Order ID: ${order.order_id}</p>
                    <p>Total Price: ${order.order_cost}</p>
                    <p>Payment Status: ${order.payment_status}</p>
                    <p>Payment Date: ${order.payment_date}</p>
                    <p>Shipment State: ${order.shipment_process}</p>
                    <p>Shipment Date: ${order.shipment_date}</p>
                    <h2>Items</h3>
                    <p>Shoes: ${order.shoes_name}</p>
                    <p>Brand: ${order.shoes_brand}</p>
                    <p>Color: ${order.shoes_color}</p>
                    <p>Type: ${order.shoes_type}</p>
                    <p>Size: ${order.shoes_size}</p>
                    <p>Total Items: ${order.order_amount}</p>

                </div>
                <a class="popup__close" data-popup2-close href="#">X</a>
            </div>
        </div>
    `;
}
export default Popup2;