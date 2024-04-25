function Products({products, pageNum, curPage}){
    /* FAKE IMAGES */
    const images = [
        '../assets/nike-am-1t.png',
        '../assets/nike14.png',
        '../assets/nike2.png',
        '../assets/nike3.png',
        '../assets/nike16.png',
        '../assets/nike18.png',
        '../assets/nike6.png',
        '../assets/nike11.png',
        '../assets/nike8.png',
        '../assets/nike9.png',
        '../assets/nike10.png',
        '../assets/nike11.png',
        '../assets/nike12.png',
        '../assets/nike13.png',
        '../assets/nike14.png',
        '../assets/nike15.png',
        '../assets/nike16.png',
        '../assets/nike17.png',
        '../assets/nike18.png',
        '../assets/nike19.png',
        '../assets/nike20.png',
    ]
    return `
        ${products.map((p, i) => `
            <div class="el-wrapper">
                <div class="box-up">
                <img class="img" src="${images[i]}" alt="">
                <div class="img-info">
                    <div class="info-inner">
                    <span class="p-name">${p.shoes_name}</span>
                    <span class="p-company">${p.shoes_brand}</span>
                    </div>
                    <div class="a-size">Available sizes : <span class="size">${p.shoes_size}</span></div>
                </div>
                </div>

                <div class="box-down">
                <div class="h-bg">
                    <div class="h-bg-inner"></div>
                </div>

                <a class="cart" href="#">
                    <span class="price">${p.shoes_price}USD</span>
                    <span class="add-to-cart">
                    <span class="txt">Order now</span>
                    </span>
                </a>
                </div>
            </div>
        `).join('')}


        <ul class="page">

            ${Array(pageNum).fill(1).map((v, i) => (
                `<li data-page=${i+1} class="page__numbers ${curPage === i + 1 ? 'active' : ''}">${i + 1}</li>`
            )).join('')}

        </ul>
    `
}

export default Products