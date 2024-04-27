function UserInfor() {
	return `
        <div class="user-infor">
            <div class="form-user">
                <div class="form-user__group">
                    <label for="fullName">Full name: </label>
                    <input name="fullName" type="text" data-name placeholder="Name">
                </div>

                <div class="form-user__group">
                    <label for="phone">Phone number: </label>
                    <input name="phone" type="number" data-phone placeholder="Phone number" required>
                </div>

                <div class="form-user__group">
                    <label for="CCCD">CCCD: </label>
                    <input name="CCCD" type="number" data-cc placeholder="CCCD" required>
                </div>

                <div class="form-user__group">
                    <label for="email">Email: </label>
                    <input name="email" type="email" data-email placeholder="Email" required>
                </div>

                <div class="form-user__group">
                    <label for="customerType">Customer Type: </label>
                    <select name="customerType" data-type>
                        <option value="Individual">Individual</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="NONE">None</option>
                    </select>
                </div>
            </div>


            <div class="user-infor__control">
                <button data-back>Back</button>
                <button data-confirm>Confirm</button>
            </div>
        </div>

    `;
}

export default UserInfor
