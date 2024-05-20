import Products from "../components/products.js";
import loadDash from "./loadDash.js";

const getProducts = async({page}) => {
    const res = await fetch(`/products?page=${page}`, {method: 'GET'});
    const products = await res.json();
    localStorage.setItem('products', JSON.stringify(products))

    return products
}


async function showProducts({page = 1}){
    const productMenu = document.querySelector('.products-list');
    const products = await getProducts({page});
    productMenu.innerHTML = Products({
        products: products.shoes,
        pageNum: products.totalPages,
        curPage: products.currentPage
    });

    await setPages();
}


async function setPages(){
    const pageNum = document.querySelectorAll('.page__numbers');
    pageNum.forEach(p => {
        const pageID = p.dataset.page;

        p.onclick = async () => {
            await showProducts({
                page: pageID
            })
        }
    })
}
await loadDash();
await showProducts({page: 1});