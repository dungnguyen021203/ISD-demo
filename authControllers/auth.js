const mysql = require('mysql2');
const md5 = require('md5');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const moment = require('moment');

const conn = mysql.createConnection({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Functions (not important for now)

exports.login = async (req, res) => {
    try {
        const {  username , password } = req.body;
        if (!username || !password) {
            return res.status(400).render('login', {
                message: 'Please provide account and password'
            });
        }
        let salt = 'mysupersercretpassword';
        let hashedPassword = await md5(password + salt);

        conn.query('', [], async (error, results) => {
            console.log(results);
            if (condition) {
                return 0;
            } else {
                const userId = results[0].user_id;
                res.cookie('loggedInUserId', userId, {
                    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true
                });
                res.status(200).redirect('/');
            }
        });
    } catch (error) {
        console.log(error);
    }
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.loggedInUserId) {
        try {
            const loggedInUserId = req.cookies.loggedInUserId;

            conn.query('', [loggedInUserId], (error, result) => {
                if (!result || result.length === 0) {
                    res.clearCookie('loggedInUserId');
                    return res.redirect('/login');
                }

                req.user = result[0];
                return next();
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/login');
        }
    } else {
        return res.redirect('/login');
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('loggedInUserId');
    res.status(200).redirect('/');
};


// IMPORTANT: The following functions are incomplete and should be used as a reference only.
// TODO: View home page with all customers

exports.home = async (req, res) => {

    conn.query(
        'SELECT * FROM Customers Where is_deleted = FALSE order by customer_id desc;',
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error fetching customers');
            }
            return res.json(results)
        }
    );
};

// TODO: Add a new customer, take the real date
async function queryDatabaseForCustomerCount(dateString) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) AS count 
            FROM Customers 
            WHERE DATE_FORMAT(add_date, '%d%m%Y') = ?
        `;
        
        conn.query(query, [dateString], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0].count);
            }
        });
    });
}


const generateCustomId = async (customerType, date) => {
    const typeAbbreviation = customerType === 'CN' ? 'CN' : customerType === 'DN' ? 'DN' : 'NONE';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    const dateString = `${day}${month}${year}`;

    const customerCountToday = await queryDatabaseForCustomerCount(dateString);
    const sequentialNumber = (customerCountToday + 1).toString().padStart(3, '0');

    const customId = `${typeAbbreviation}${sequentialNumber}${dateString}`;
    
    return customId;
};


exports.addCustomer = async (req, res) => {
    const { name, phone, cc, email, type } = req.body;
    const saleID = 1;

    try {
        const date = new Date();
        const customerCode = await generateCustomId(type, date);

        const insertCustomerQuery = `
        INSERT INTO Customers (sales_id, customer_type, customer_code, customer_name, customer_email, customer_phoneNumber, customer_citizenID, add_date, website_account_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conn.query(insertCustomerQuery, [saleID, type, customerCode, name, email, phone, cc, date, saleID], (customerError, customerResults) => {
            if (customerError) {
                console.error(customerError);
                return res.status(500).send('Error adding customer');
            }
            return res.json({ message: "Customer added successfully" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};




// TODO: View a customer's details
exports.details = async (req, res) => {
    const customerId = req.params.id;

    const customerQuery = 'SELECT * FROM Customers WHERE customer_id = ?';

    conn.query(customerQuery, [customerId], (error, customerResults) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error fetching customer details');
        }

        if (customerResults.length > 0) {
            const customer = customerResults[0];
            const query = `
                SELECT Customers.*, WebsiteAccounts.username
                FROM Customers
                LEFT JOIN WebsiteAccounts ON Customers.website_account_id= WebsiteAccounts.account_id
                WHERE Customers.customer_id = ?
            `;
            conn.query(query, [customerId], (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('Error fetching related details');
                }
                if (results.length === 0) {
                    return res.json({
                        customer: customer,
                        CustomerActiveAccounts: "No active accounts found for this customer"
                    });
                }
                else {
                return res.json({
                    customer: customer,
                    CustomerActiveAccounts: results
                });
                }
            });
        } else {
            return res.status(404).send('Customer not found');
        }
    });
};

//TODO: Soft delete the customer and move it to the trash can, it can recover before 10 days
exports.deleteCustomer = async (req, res) => {
    const customerId = req.params.id;

    const deleteQuery = 'UPDATE Customers SET is_deleted = TRUE, deleted_at = NOW() WHERE customer_id = ?;';

    conn.query(deleteQuery, [customerId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error deleting customer');
        }

        if (results.affectedRows > 0) {
            return res.json({ message: 'Customer deleted successfully' });
        } else {
            return res.status(404).send('Customer not found');
        }
    });
};

//TODO: Recover the customer from the trash can if possible
exports.recoverCustomer = async (req, res) => {
    const customerId = req.params.id;

    const recoverQuery = 'UPDATE Customers SET is_deleted = FALSE, deleted_at = NULL WHERE customer_id = ?;';

    conn.query(recoverQuery, [customerId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error recovering customer');
        }

        if (results.affectedRows > 0) {
            return res.json({ message: 'Customer recovered successfully' });
        } else {
            return res.status(404).send('Customer not found');
        }
    });
};

//TODO: Show the trash's customers
exports.trash = async (req, res) => {
    conn.query(
        'SELECT * FROM Customers Where is_deleted = TRUE',
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error fetching customers');
            }
            const formattedResults = results.map(customer => ({
                ...customer,
                deleted_at: moment(customer.deleted_at).format('YYYY-MM-DD HH:mm:ss')
            }));
            
            return res.json(formattedResults);
        }
    );
};

//TODO: Edit the customer's details
exports.editCustomer = async (req, res) => {
    const customerId = req.params.id;
    const updates = req.body;
    let query = 'UPDATE Customers SET ';
    let queryParams = [];
    let updatedField = [];

    Object.keys(updates).forEach(key => {
        if (['name', 'email', 'phoneNumber', 'citizenID'].includes(key)) {
            updatedField.push(`customer_${key} = ?`);
            queryParams.push(updates[key]);
        }
    });

    if (updatedField.length === 0) {
        return res.status(400).send('No valid fields provided for update');
    }

    query += updatedField.join(', ');
    query += ' WHERE customer_id = ?';
    queryParams.push(customerId);

    conn.query(query, queryParams, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error updating customer');
        }

        if (results.affectedRows > 0) {
            return res.json({ message: 'Customer updated successfully' });
        } else {
            return res.status(404).send('Customer not found');
        }
    });
};

//TODO: Show the products showcase
exports.productsShowcase = async (req, res) => {
    const shoesPerPage = 9; 
    const page = req.query.page || 1; 

    conn.query("SELECT COUNT(*) AS count FROM Shoes", (error, countResult) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error fetching product count');
        }

        const totalCount = countResult[0].count;
        const totalPages = Math.ceil(totalCount / shoesPerPage);
        const offset = (page - 1) * shoesPerPage;

        conn.query("SELECT * FROM Shoes LIMIT ? OFFSET ?", [shoesPerPage, offset], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error fetching products');
            }

            return res.json({
                shoes: results,
                totalItems: totalCount,
                totalPages: totalPages,
                currentPage: parseInt(page)
            });
        });
    });
};

// TODO: Show the customer's orders
exports.customerOrders = async (req, res) => {
    const customerId = req.params.id;

    const query = `
        SELECT Orders.*, Shoes.*
        FROM Orders
        JOIN Shoes ON Orders.shoes_id = Shoes.shoes_id
        WHERE Orders.customer_id = ?
    `;

    conn.query(query, [customerId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error fetching orders');
        }

        const formattedResults = results.map(orders => ({
            ...orders,
            order_buyDate: moment(orders.order_buyDate).format('YYYY-MM-DD HH:mm:ss')
        }));

        console.log(formattedResults);

        return res.json(formattedResults);
    });
};