function PopUp({
    title,
    type,
    link,
    desc,
    hasClose = false,
    isAdd = true,
    ctinue = true,
}) {
    console.log(isAdd);
    return `
        <div class="popUp-wrapper">
            <div id="darkBack"></div>
            <div id="popUp">
            ${
                hasClose
                    ? '<div id="close" data-popup-close class="close">x</div>'
                    : ''
            }
            <div id="new"><span>${title}</span></div>
            <h2>${
                desc ||
                "I'm a notification popup that isn't too distracting or in your face. Scroll down or close me and I will go away. You'll still be able to open me later on don't worry."
            }</h2>
            <br>
            ${
                link && isAdd
                    ? `<a href="http://localhost:8000/pages/home.html" class="button">Go home</a>`
                    : ''
            }
            ${
                ctinue
                    ? `<button data-back-to-detail class="button" style="margin: 0 auto;text-align: center;right: 0;left: 0;position: absolute;margin-top:40px;">Back to Details</button>`
                    : ''
            }
            ${
                !isAdd
                    ? `
                    <button  class="button" data-ok>Ok</button>
                    <button  class="button" data-cancel>Cancel</button>
            `
                    : ''
            }
            </div>
        </div>
    `;
}

export default PopUp;