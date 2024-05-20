function UserDetail({ user, mode = 'normal' }) {
    const customer = user.customer;
    const CustomerAC = user.CustomerActiveAccounts;
    const accountsHtml = CustomerAC.map(
        (ac) => `
        <div class="user-detail__content">
            <div class="block">
                <div class="prop">Account Name:</div>
                <div class="value">${ac.username}</div>
            </div>
        </div>
    `
    ).join('');
    return `
        <div class="user-detail">
            <h2>Thông tin tài khoản active</h2>

            ${accountsHtml}
        </div>

        <div class="user-detail">
            <h2>Thông tin liên hệ khách hàng</h2>

            <div class="user-detail__content">
                <div class="block">
                    <div class="prop">Name:</div>
                    <div class="value">${customer.customer_name}</div>
                </div>
                <div class="block">
                    <div class="prop">Code:</div>
                    <div class="value">${customer.customer_code}</div>
                </div>
                <div class="block">
                    <div class="prop">Customer Type:</div>
                    <div class="value">${customer.customer_type}</div>
                </div>
                <div class="block">
                    <div class="prop">Citizen ID:</div>
                    <div class="value">${customer.customer_citizenID}</div>
                </div>
                <div class="block">
                    <div class="prop">Email:</div>
                    <div class="value">${customer.customer_email}</div>
                </div>
                <div class="block">
                    <div class="prop">Phone:</div>
                    <div class="value">${
                        customer.customer_phoneNumber
                    }</div>
                </div>
                <div class="block">
                    <div class="prop">Sales:</div>
                    <div class="value">Jane Smith</div>
                </div>
            </div>
        </div>
        <button data-menu-back class="button-abc">Back to menu</button>
        ${
            mode !== 'trash'
                ? `
            <button
                    data-menu-back
                    class='button-abc'
                    data-edit-detail>
                    Edit customer
                </button>
            `
                : ''
        }
    `;
}

function button() {}

export default UserDetail;