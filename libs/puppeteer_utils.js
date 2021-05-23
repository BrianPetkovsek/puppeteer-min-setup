async function typeInputBox(page, elm, val, delay=20){
    await page.waitForSelector(elm)
    await page.type(elm, val, {delay: delay})
}

async function fillInputBox(page, elm, val){
    await page.waitForSelector(elm)
    await page.$eval(elm, (el, val) => {el.value = val}, val);
}

async function dualAction(func1, func1_args, func2, func2_args){
    not_done = true
    async function f1(){
        while(not_done) 
            await func1(...func1_args)
    }

    f1()
    await func2(...func2_args)
    not_done = false
}

exports.typeInputBox = typeInputBox
exports.fillInputBox = fillInputBox
exports.dualAction = dualAction
