document.addEventListener('DOMContentLoaded', () => {
    const signUpCount = 114;  
    const revenue = 25541;    
    const openTickets = 5;    

    document.querySelector('.dashboard-card.blue .card-body h2').innerText = signUpCount;
    document.querySelector('.dashboard-card.green .card-body h2').innerText = `$${revenue.toLocaleString()}`;
    document.querySelector('.dashboard-card.red .card-body h2').innerText = openTickets;

    // Initialize charts
    const ctxSignups = document.getElementById('signupsChart').getContext('2d');
    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    const ctxTickets = document.getElementById('ticketsChart').getContext('2d');

    const signupsChart = new Chart(ctxSignups, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Sign ups',
                data: [10, 20, 5, 10, 3, 2, 15],
                backgroundColor: 'rgba(0, 123, 255, 0.8)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const revenueChart = new Chart(ctxRevenue, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Revenue',
                data: [1000, 2500, 500, 1000, 300, 200, 1500],
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const ticketsChart = new Chart(ctxTickets, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Customers',
                data: [0, 0, 0, 5, 1, 0, 0],
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Tab switching logic
    const tabs = document.querySelectorAll('.chart-tab');
    const charts = document.querySelectorAll('.chart');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const chartToShow = tab.getAttribute('data-chart');

            charts.forEach(chart => {
                chart.style.display = 'none';
            });

            document.getElementById(`${chartToShow}-chart`).style.display = 'block';
        });
    });
});
