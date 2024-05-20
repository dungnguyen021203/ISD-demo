const mysql = require('mysql2');
const md5 = require('md5');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const moment = require('moment');

const conn = mysql.createConnection({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .send('Please provide username and password');
        }
        let salt = 'mysupersercretpassword';
        let hashedPassword = md5(password + salt);

        const query = `
            SELECT sales_id, username, role FROM Salespersons
            WHERE username = ? AND password = ?
        `;

        conn.query(query, [username, hashedPassword], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error during database query');
            }
            if (results.length > 0) {
                const sales = results[0];
                res.cookie('loggedInUserId', sales.sales_id, {
                    expires: new Date(Date.now() + 8 * 3600000),
                    httpOnly: true,
                });
                res.redirect('/home');
            } else {
                res.status(401).json({ message: 'Invalid username or password' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.loggedInUserId) {
        try {
            const loggedInUserId = req.cookies.loggedInUserId;

            conn.query(
                'SELECT * FROM Salespersons WHERE sales_id = ?',
                [loggedInUserId],
                (error, result) => {
                    if (!result || result.length === 0) {
                        res.clearCookie('loggedInUserId');
                        return res.redirect('/login');
                    }

                    req.user = result[0];
                    return next();
                }
            );
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

exports.home = async (req, res, next) => {
    const saleID = req.cookies.loggedInUserId;
    if (req.user.role === 'admin') {
        const query = `
            SELECT Customers.*, Salespersons.*
            FROM Customers
            JOIN Salespersons ON Customers.sales_id = Salespersons.sales_id
            WHERE Customers.is_deleted = FALSE AND Customers.sales_id In (?, ?, ?)
            ORDER BY Customers.customer_id DESC;
        `;
        conn.query(query, [1,2,3], (error, results) => {
            if (error) {
                console.error(error);
                return res
                    .status(500)
                    .send('Error fetching salespersons and customers');
            }
            const finalResults = {
                customers: results,
                isAdmin: req.user.role,
            }
            return res.json(finalResults);
        });
    } else {
        conn.query(
                `SELECT Customers.*, Salespersons.*
                FROM Customers
                JOIN Salespersons ON Customers.sales_id = Salespersons.sales_id
                WHERE Customers.is_deleted = FALSE AND Customers.sales_id = ?
                ORDER BY Customers.customer_id DESC;`,
            [saleID],
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res
                        .status(500)
                        .send('Error fetching customers');
                }
                return res.json(results);
            }
        );
    }
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
    const typeAbbreviation =
        customerType === 'Individual'
            ? 'CN'
            : customerType === 'Enterprise'
                ? 'DN'
                : 'NONE';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    const dateString = `${day}${month}${year}`;

    const customerCountToday = await queryDatabaseForCustomerCount(
        dateString
    );
    const sequentialNumber = (customerCountToday + 1)
        .toString()
        .padStart(3, '0');

    const customId = `${typeAbbreviation}${sequentialNumber}${dateString}`;

    return customId;
};

exports.addCustomer = async (req, res) => {
    const { name, phoneNumber, citizenID, email, type } = req.body;
    const saleID = req.cookies.loggedInUserId;

    try {
        const date = new Date();
        const customerCode = await generateCustomId(type, date);
        const randomSalesAgent = Math.floor(Math.random() * 3) + 1;

        const insertCustomerQuery = `
        INSERT INTO Customers (sales_id, customer_type, customer_code, customer_name, customer_email, customer_phoneNumber, customer_citizenID, add_date, website_account_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        if (req.user.role === 'admin') {
            conn.query(
                insertCustomerQuery,
                [randomSalesAgent, type, customerCode, name, email, phoneNumber, citizenID, date , randomSalesAgent],
                (customerError, customerResults) => {
                    if (customerError) {
                        console.error(customerError);
                        return res
                            .status(500)
                            .send('Error adding customer');
                    }
                    return res.json({
                        message: 'Customer added successfully',
                    });
                }
            );
        } else {
            conn.query(
                insertCustomerQuery,
                [saleID, type, customerCode, name, email, phoneNumber, citizenID, date, randomSalesAgent],
                (customerError, customerResults) => {
                    if (customerError) {
                        console.error(customerError);
                        return res
                            .status(500)
                            .send('Error adding customer');
                    }
                    return res.json({
                        message: 'Customer added successfully',
                    });
                }
            );
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};

exports.details = async (req, res) => {
    const customerId = req.params.id;

    const customerQuery =
        'SELECT * FROM Customers WHERE customer_id = ?';

    conn.query(
        customerQuery,
        [customerId],
        (error, customerResults) => {
            if (error) {
                console.error(error);
                return res
                    .status(500)
                    .send('Error fetching customer details');
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
                        return res
                            .status(500)
                            .send('Error fetching related details');
                    }
                    if (results.length === 0) {
                        return res.json({
                            customer: customer,
                            CustomerActiveAccounts:
                                'No active accounts found for this customer',
                        });
                    } else {
                        return res.json({
                            customer: customer,
                            CustomerActiveAccounts: results,
                        });
                    }
                });
            } else {
                return res.status(404).send('Customer not found');
            }
        }
    );
};

exports.deleteCustomer = async (req, res) => {
    const customerId = req.params.id;

    const deleteQuery =
        'UPDATE Customers SET is_deleted = TRUE, deleted_at = NOW() WHERE customer_id = ?;';

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

exports.recoverCustomer = async (req, res) => {
    const customerId = req.params.id;

    const recoverQuery =
        'UPDATE Customers SET is_deleted = FALSE, deleted_at = NULL WHERE customer_id = ?;';

    conn.query(recoverQuery, [customerId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error recovering customer');
        }

        if (results.affectedRows > 0) {
            return res.json({
                message: 'Customer recovered successfully',
            });
        } else {
            return res.status(404).send('Customer not found');
        }
    });
};

exports.trash = async (req, res) => {
    const salesId = req.cookies.loggedInUserId;
    if (req.user.role === 'admin') {
        conn.query(
                `SELECT Customers.*, Salespersons.*
                FROM Customers
                JOIN Salespersons ON Customers.sales_id = Salespersons.sales_id
                WHERE Customers.is_deleted = True AND Customers.sales_id in (?, ?, ?)
                ORDER BY Customers.customer_id DESC;
                    `, [1,2,3], (error, results) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Error fetching customers');
                    }
                    const formattedResults = results.map((customer) => ({
                        ...customer,
                        deleted_at: moment(customer.deleted_at).format(
                            'YYYY-MM-DD HH:mm:ss'
                        ),
                    }));

                    const finalResults = {
                        customerTrashAdmin: formattedResults,
                        isAdmin: req.user.role,
                    }

                    return res.json(finalResults);
                });
        } else {
            conn.query(
                `SELECT Customers.*, Salespersons.*
                FROM Customers
                JOIN Salespersons ON Customers.sales_id = Salespersons.sales_id
                WHERE Customers.is_deleted = True AND Customers.sales_id = ?
                ORDER BY Customers.customer_id DESC;
                    `, [salesId], (error, results) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Error fetching customers');
                    }
                    const formattedResults = results.map((customer) => ({
                        ...customer,
                        deleted_at: moment(customer.deleted_at).format(
                            'YYYY-MM-DD HH:mm:ss'
                        ),
                    }));

                    return res.json(formattedResults);
                });
    }
}; 


exports.editCustomer = async (req, res) => {
    const customerId = req.params.id;
    const updates = req.body;
    let query = 'UPDATE Customers SET ';
    let queryParams = [];
    let updatedField = [];

    Object.keys(updates).forEach((key) => {
        if (['name', 'email', 'phoneNumber', 'citizenID', 'type'].includes(key)) {
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

exports.productsShowcase = async (req, res) => {
    const shoesPerPage = 9;
    const page = req.query.page || 1;

    conn.query(
        'SELECT COUNT(*) AS count FROM Shoes',
        (error, countResult) => {
            if (error) {
                console.error(error);
                return res
                    .status(500)
                    .send('Error fetching product count');
            }

            const totalCount = countResult[0].count;
            const totalPages = Math.ceil(totalCount / shoesPerPage);
            const offset = (page - 1) * shoesPerPage;

            conn.query(
                'SELECT * FROM Shoes LIMIT ? OFFSET ?',
                [shoesPerPage, offset],
                (error, results) => {
                    if (error) {
                        console.error(error);
                        return res
                            .status(500)
                            .send('Error fetching products');
                    }

                    return res.json({
                        shoes: results,
                        totalItems: totalCount,
                        totalPages: totalPages,
                        currentPage: parseInt(page),
                    });
                }
            );
        }
    );
};


exports.customerOrders = async (req, res) => {
    const customerId = req.params.id;

    const query = `
        SELECT Orders.*, Shoes.*, Customers.*
        FROM Orders
        JOIN Shoes ON Orders.shoes_id = Shoes.shoes_id
        JOIN Customers ON Orders.customer_id = Customers.customer_id
        WHERE Orders.customer_id in (?, ?, ?, ?);
    `;

    conn.query(query, [1,2,3,4], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error fetching orders');
        }

        const formattedResults = results.map((orders) => ({
            ...orders,
            order_buyDate: moment(orders.order_buyDate).format(
                'YYYY-MM-DD HH:mm:ss'
            ),
            payment_date: moment(orders.payment_date).format(
                'YYYY-MM-DD HH:mm:ss'
            ),
            shipment_date: moment(orders.shipment_date).format(
                'YYYY-MM-DD HH:mm:ss'
            ),
        }));

        return res.json(formattedResults);
    });
};
