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
                res.send('Login failed');
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
    res.status(200).redirect('/?#');
};

exports.home = async (req, res, next) => {
    const saleID = req.cookies.loggedInUserId;
    if (req.user.role === 'admin') {
        const query = `
            SELECT s.*, c.*
            FROM Salespersons s
            JOIN Customers c ON s.sales_id = c.sales_id
            ORDER BY s.sales_id
        `;
        conn.query(query, (error, results) => {
            if (error) {
                console.error(error);
                return res
                    .status(500)
                    .send('Error fetching salespersons and customers');
            }
            return res.json(results);
        });
    } else {
        conn.query(
            'SELECT * FROM Customers Where is_deleted = FALSE and sales_id = ? order by customer_id desc;',
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
    const { name, phone, cc, email, type, salesid } = req.body;
    const saleID = req.cookies.loggedInUserId;

    try {
        const date = new Date();
        const customerCode = await generateCustomId(type, date);

        const insertCustomerQuery = `
        INSERT INTO Customers (sales_id, customer_type, customer_code, customer_name, customer_email, customer_phoneNumber, customer_citizenID, add_date, website_account_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        if (req.user.role === 'admin') {
            conn.query(
                insertCustomerQuery,
                [
                    salesid,
                    type,
                    customerCode,
                    name,
                    email,
                    phone,
                    cc,
                    date,
                    salesid,
                ],
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
                [
                    saleID,
                    type,
                    customerCode,
                    name,
                    email,
                    phone,
                    cc,
                    date,
                    saleID,
                ],
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

// TODO: View a customer's details
exports.details = async (req, res) => {
    const customerId = req.params.id;
    const saleID = req.cookies.loggedInUserId;

    const customerQuery =
        'SELECT * FROM Customers WHERE customer_id = ? and sales_id = ?';

    conn.query(
        customerQuery,
        [customerId, saleID],
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

//TODO: View salesperson's details
exports.salespersonDetails = async (req, res) => {
    const query = 'SELECT * FROM Salespersons WHERE role = "sales"';
    if (req.user.role === 'admin') {
        conn.query(query, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error fetching salespersons');
            }
            return res.json(results);
        });
    } else {
        return res
            .status(403)
            .send('You are not authorized to view this page');
    }
};

//TODO: Soft delete the customer and move it to the trash can, it can recover before 30 days
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

//TODO: Recover the customer from the trash can if possible
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

//TODO: Permantly delete the customer from the trash can for admin only
exports.permanentDelete = async (req, res) => {
    const customerId = req.params.id;
    const permanentlyDeleteQuery =
        'DELETE FROM Customers WHERE customer_id = ?;';
    if (req.user.role === 'admin') {
        conn.query(
            permanentlyDeleteQuery,
            [customerId],
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('Error deleting customer');
                }
                if (results.affectedRows > 0) {
                    return res.json({
                        message: 'Customer deleted successfully',
                    });
                } else {
                    return res.status(404).send('Customer not found');
                }
            }
        );
    } else {
        return res
            .status(403)
            .send('You are not authorized to do this action');
    }
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
            const formattedResults = results.map((customer) => ({
                ...customer,
                deleted_at: moment(customer.deleted_at).format(
                    'YYYY-MM-DD HH:mm:ss'
                ),
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

    Object.keys(updates).forEach((key) => {
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

//TODO: Search for a customer
exports.customerSearch = async (req, res) => {
    const search = req.query.search;
    const trashSearch = req.query.trashSearch;

    const query = `
        SELECT *
        FROM Customers
        WHERE customer_name LIKE ?`;
    const trashQuery = `SELECT * FROM Customers WHERE customer_name LIKE ? AND is_deleted = TRUE`;
    if (trashSearch) {
        conn.query(trashQuery, [`%${trashSearch}%`], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error searching customers');
            }
            res.json(results);
        });
    } else {
        conn.query(query, [`%${search}%`], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error searching customers');
            }
            res.json(results);
        });
    }
};

//TODO: Sort the customers by name
exports.customerSorting = async (req, res) => {
    const sort = req.query.sort;
    const trashSort = req.query.trashSort;
    const query = `SELECT * FROM Customers ORDER BY customer_name ${sort}`;
    const trashQuery = `SELECT * FROM Customers WHERE is_deleted = TRUE ORDER BY customer_name ${trashSort}`;

    if (trashSort) {
        conn.query(trashQuery, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sorting customers');
            }
            res.json(results);
        });
    } else {
        conn.query(query, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error sorting customers');
            }
            res.json(results);
        });
    }
};

//TODO: Filter the customers by category
exports.customerFilterCategory = async (req, res) => {
    const category = req.query.category;
    const trashCategory = req.query.trashCategory;
    const query = `SELECT * FROM Customers WHERE customer_type = ?`;
    const trashQuery = query + `AND is_deleted = TRUE`;

    if (trashCategory) {
        conn.query(trashQuery, [trashCategory], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error filtering customers');
            }
            res.json(results);
        });
    } else {
        conn.query(query, [category], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error filtering customers');
            }
            res.json(results);
        });
    }
};
