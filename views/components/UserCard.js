function UserCards({users=[], buttonTitle ="remove"}){
    return `
        <div class="customer-cards">
            ${users.map(user => `
                    <div class="customer-card" data-name=${user.customer_name}>
                        <div class="customer-details">
                            <div class="logo">
                                <img src=${user.customer_avatar || 'https://static.vecteezy.com/system/resources/previews/009/398/577/original/man-avatar-clipart-illustration-free-png.png'} alt="logo_img">
                            </div>
                            <div class="text">
                                <h2>${user.customer_name}</h2>
                                <span>${user.customer_phoneNumber}</span>
                                <span>Sales: ${user.sales_name}</span>
                                <span>${user.customer_email}</span>
                            </div>
                        </div>
                        <div class="customer-description">
                            <h4><span>${user.customer_type}</span></h4>
                            <span class="detail" data-id=${user.customer_id} data-button>Details</span>
                            <span class="customer-remove" data-remove data-button>${buttonTitle}</span>
                        </div>
                    </div>
            `)}
        </div>
    `
}

export default UserCards;