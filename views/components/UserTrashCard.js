function UserTrashCards({users=[], buttonTitle ="remove"}){
    return `
        <div class="customer-cards">
            ${users.map(user => `
                    <div class="customer-card" data-name=${user.customer_name}>
                        <div class="customer-details">
                            <div class="logo">
                                <img src=${user.customer_avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCSz8LW0ISgUJU7DHInjGARqUCUzgDY57qA0N70xf4s5dmVTedLDXU0CndAc6p1CluACc&usqp=CAU'} alt="logo_img">
                            </div>
                            <div class="text">
                                <h2>${user.customer_name}</h2>
                                <span>${user.customer_phoneNumber}</span>
                                <span>${user.deleted_at}</span>
                                <hr>
                                <span>${user.customer_email}</span>
                            </div>
                        </div>
                        <div class="customer-description">
                            <h4>Bronze</h4>
                            <span class="detail" data-id=${user.customer_id} data-button>Details</span>
                            <span class="customer-remove" data-remove data-button>${buttonTitle}</span>
                        </div>
                    </div>
            `)}
        </div>
    `
}

export default UserTrashCards;