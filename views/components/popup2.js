function Popup2(order) {
    return `
        <div class="popup" id="popup">
            <div class="popup-inner">
                <div class="popup__text">
                    <h2>Order Details</h2>
                    <p>Order Code: #${order.order_code}</p>
                    <p>Order Time: ${order.order_buyDate}</p>
                    <p>Order ID: ${order.order_id}</p>
                    <p>Total Price: ${order.order_cost}</p>
                    <p>Payment Status: ${order.payment_status}</p>
                    <p>Payment Date: ${order.payment_date}</p>
                    <p>Shipment State: ${order.shipment_process}</p>
                    <p>Shipment Date: ${order.shipment_date}</p>
                    <br>
                    <h2>Items</h2>
                    <p>Shoes: ${order.shoes_name}</p>
                    <p>Brand: ${order.shoes_brand}</p>
                    <p>Color: ${order.shoes_color}</p>
                    <p>Type: ${order.shoes_type}</p>
                    <p>Size: ${order.shoes_size}</p>
                    <p>Total Items: ${order.order_amount}</p>
                    <br>
                    <h2>Customer</h2>
                    <p>Name: ${order.customer_name}</p>
                    <p>Customer Code: ${order.customer_code}</p>

                </div>
                <a class="popup__close" data-popup2-close href="#">X</a>
            </div>
        </div>
    `;
}
export default Popup2;