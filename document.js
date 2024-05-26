function getWebviewContent(cssSrc, tableName) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="${cssSrc}">
    </head>
    <body class="bg-black">
        <div class="bg-gradient-to-r from-orange-400 to-violet-600 p-5">
            <p class="font-sans text-white text-xl italic font-bold">MyBatis Plus Code Generator</p>
            <p class="font-sans text-white text-right text-lg underline decoration-pink-400">Author: huangtao</p>
        </div>
        <div class="bg-white p-5 mt-20 mx-auto rounded-xl flex-col max-w-3xl min-w-xl">
            <div class="mb-5 font-sans text-violet-900 text-2xl">Table: ${tableName}</div>
            <form id="config">
                <div class="flex justify-between">
                    <div>
                        <div class="w-20 text-left font-sans text-violet-700 text-lg">Module:</div>
                        <div>
                            <input type="text" name="module" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="module name or empty">
                        </div>
                    </div>
                    <div class="">
                        <div class="w-20 text-left font-sans text-violet-700 text-lg">Package:</div>
                        <div class="">
                            <input type="text" name="package" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="com.example">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-5">
                    <div>
                        <div class="w-20 text-left font-sans text-violet-700 text-lg">Author:</div>
                        <div>
                            <input type="text" name="author" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="your name">
                        </div>
                    </div>
                    <div>
                        <div class="w-40 text-left font-sans text-violet-700 text-lg">Primary Key Type:</div>
                        <div class="">
                            <select name="pktype" class="border-4 border-violet-800 rounded-lg w-64 h-8">
                                <option value="0">Auto Increment</option>
                                <option value="1">Snow Flake</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-5">
                    <div>
                        <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                            <input type="checkbox" name="genEntity" class="size-4">
                            <p class="leading-4 ml-2">Entity</p>
                        </div>
                        <div class="mt-2">
                            <input type="text" name="entitypkg" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="domain.po">
                        </div>
                    </div>
                    <div>
                        <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                            <input type="checkbox" name="genMapper" class="size-4">
                            <p class="leading-4 ml-2">Mapper</p>
                        </div>
                        <div class="mt-2">
                            <input type="text" name="mapperpkg" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="mapper">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-5">
                    <div>
                        <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                            <input type="checkbox" name="genService" class="size-4">
                            <p class="leading-4 ml-2">Service</p>
                        </div>
                        <div class="mt-2">
                            <input type="text" name="servicepkg" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="service">
                        </div>
                    </div>
                    <div>
                        <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                            <input type="checkbox" name="genServiceImpl" class="size-4">
                            <p class="leading-4 ml-2">ServiceImpl</p>
                        </div>
                        <div class="mt-2">
                            <input type="text" name="serviceImplpkg" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="service.impl">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-5">
                    <div>
                        <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                            <input type="checkbox" name="genController" class="size-4">
                            <p class="leading-4 ml-2">Controller</p>
                        </div>
                        <div class="mt-2">
                            <input type="text" name="controllerpkg" class="border-4 border-violet-800 rounded-lg w-64 h-8 font-mono text-black" placeholder="controller">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-10">
                    <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                        <input type="checkbox" name="genRestController" class="size-4">
                        <p class="leading-4 ml-2">restController</p>
                    </div>
                    <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                        <input type="checkbox" name="genLombok" class="size-4">
                        <p class="leading-4 ml-2">lombok</p>
                    </div>
                    <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                        <input type="checkbox" name="genSwagger" class="size-4">
                        <p class="leading-4 ml-2">swagger</p>
                    </div>
                    <div class="flex w-40 text-left font-sans text-violet-700 text-lg">
                        <input type="checkbox" name="genResultMap" class="size-4">
                        <p class="leading-4 ml-2">ResultMap</p>
                    </div>
                </div>
                <div class="mt-5 flex justify-center space-x-32">
                    <button type="button" id="genbtn" class="bg-violet-800 hover:bg-violet-900 text-white text-xl p-5 rounded-full w-60">Generate Code</button>
                    <button type="button" id="savbtn" class="bg-violet-800 hover:bg-violet-900 text-white text-xl p-5 rounded-full w-60">Save Options</button>
                </div>
            </form>
        </div>
    </body>
    <script>
    const vscode = acquireVsCodeApi();
    const form = document.getElementById('config')
    const genbtn = document.getElementById('genbtn')
    const savbtn = document.getElementById('savbtn')
    
    genbtn.addEventListener('click', () => {
        const data = new FormData(form)
        const formdata = Object.fromEntries(data.entries());
        vscode.postMessage({
            command: 'genCode',
            text: JSON.stringify(formdata)
        })
    })
    
    savbtn.addEventListener('click', () => {
        const data = new FormData(form);
        const formdata = Object.fromEntries(data.entries());
        vscode.postMessage({
            command: 'save',
            text: JSON.stringify(formdata)
        })
    })
    
    window.addEventListener('message', event => {
        const message = event.data;
        const data = message.data
    
        for (let key in data) {
            const elem = document.getElementsByName(key)[0];
            if (elem) {
                elem.value = data[key];
            }
        }
    })
    </script>
    </html>`
}

module.exports = {
    getWebviewContent
}