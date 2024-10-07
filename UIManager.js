export default class {
    #_lastButtonId = 0;
    #_lastTopLength = 0;
    #_topPage = 0;
    #_takeCount = 10;
    #_elements = {
        buttons: [...document.querySelectorAll('.screen')],
        topElement: document.querySelector('#top'),
        tonRate: document.querySelector('#tonRate')
    };
    #_screens = {
        MAIN: 0,
        TOP: 1,
        WITHDRAW: 2,
        REPLENISH: 3  
    };
    #_playerData;
    #_gameManager;

    async init (gameManager, playerData) {
        this.#_gameManager = gameManager;
        this.#_playerData = playerData;

        const balance = Number(this.#_playerData.balance.toFixed(2));

        document.querySelector('#userBalance').textContent = balance.toLocaleString('ru-RU');
        ['play','withdraw'].map(x => document.querySelector(`#${x}Amount`).setAttribute('max', balance));

        document.querySelector('#playButton').addEventListener('click', ({ isTrusted }) => isTrusted && this.#_toggleAmountForm());

        document.querySelector('#playConfirm').addEventListener('click', ({ isTrusted }) => isTrusted && this.#_confirmAmountForm());
        document.querySelector('#withdrawConfirm').addEventListener('click', ({ isTrusted }) => isTrusted && this.#_confirmWithdraw());
        document.querySelector('#replenishConfirm').addEventListener('click', ({ isTrusted }) => isTrusted && this.#_confirmReplenish());

        document.querySelector('#resultButton').addEventListener('click', ({ isTrusted }) => isTrusted && this.#_confirmResult());

        ['previous','next'].map(type => document.querySelector(`#${type}Page`).addEventListener('click', ({ isTrusted }) => isTrusted && this.#_toggleTopPage(type)));

        [...document.querySelectorAll('[data-id]')].map(el => {
            const buttonId = +el.getAttribute('data-id');

            el.addEventListener('click', async () => {
                if(buttonId === this.#_lastButtonId) return;

                el.setAttribute('class', 'selected');

                document.querySelector(`[data-id="${this.#_lastButtonId}"]`).removeAttribute('class');

                this.#_elements.buttons[this.#_lastButtonId].style.display = 'none';

                this.#_elements.buttons[buttonId].style.display = (buttonId === this.#_screens.MAIN || buttonId === this.#_screens.TOP) ? 'flex' : 'block';

                this.#_lastButtonId = buttonId;

                if(buttonId === this.#_screens.MAIN) this.#_updateBalance();
                if(buttonId === this.#_screens.TOP) this.#_makeTopPage(await this.#_playerData.getTopGames(this.#_takeCount, this.#_takeCount * this.#_topPage));
                if(buttonId === this.#_screens.REPLENISH) this.#_updateTonRate();
            });
        });
    };

    #_toggleAmountForm () {
        const playForm = document.querySelector('#playForm');

        playForm.style.visibility = ['hidden','visible'][+(playForm.style.visibility === 'hidden')]
    };

    async #_confirmAmountForm () {
        const amountEl = document.querySelector('#playAmount'),
        amount = parseInt(amountEl.value);

        console.log('AMOUNT', amount);

        if(isNaN(amount) || amount < 0 || amount > this.#_playerData.balance) return alert('AMOUNT IS NOT VALID.');

        amountEl.value = 0;

        this.#_toggleAmountForm();

        this.#_gameManager.initLevel(amount, ...(await this.#_playerData.createGame(amount)));
    };

    async #_confirmResult () {
        this.#_updateBalance();

        document.querySelector('#resultForm').style.visibility = 'hidden';
    };

    async #_toggleTopPage (type) {
        const increment = type === 'next' ? 1 : -1;

        if((this.#_topPage === 0 && increment === -1) || ((this.#_lastTopLength < this.#_takeCount) && increment === 1)) return;

        this.#_topPage += increment;

        this.#_makeTopPage(await this.#_playerData.getTopGames(this.#_takeCount, this.#_takeCount * this.#_topPage));
    };

    #_makeTopPage (topData) {
        this.#_lastTopLength = topData.items.length;

        this.#_elements.topElement.innerHTML = '';

        topData.items.map(({ id, betSize, multiplier, result }) => {
            const game = document.createElement('div');

            game.innerHTML = `<span>id: ${id}</span>
                    <span>bet size: ${betSize}</span>
                    <span>multiplier: ${multiplier}</span>
                    <span>result: ${result}</span>`;

            this.#_elements.topElement.append(game);
        });
    };
    
    async #_updateTonRate () {
        this.#_elements.tonRate.textContent = `TON RATE: ${(await this.#_playerData.getTonRate()).tonToCoinsMultiplier}`;
    };

    async #_updateBalance () {
        const balance = await this.#_playerData.getBalance();

        document.querySelector('#userBalance').textContent = balance;
        ['play','withdraw'].map(x => document.querySelector(`#${x}Amount`).setAttribute('max', balance));
    };

    async #_confirmWithdraw () {
        const amountEl = document.querySelector('#withdrawAmount'),
        amount = parseInt(amountEl.value);
    
        console.log('AMOUNT', amount);
    
        if(isNaN(amount) || amount <= 0 || amount > this.#_playerData.balance) return alert('AMOUNT IS NOT VALID.');
    
        amountEl.value = 0;

        await this.#_playerData.createWithdraw(amount);
    
        this.#_updateBalance();

        alert('WITHDRAW HAS BEEN CREATED!');
    };

    async #_confirmReplenish () {
        const amount = parseInt(document.querySelector('#replenishAmount').value);

        if(!amount || isNaN(amount) || amount < 0) return alert('AMOUNT IS NOT VALID.');

        const { destinationAddress, transactionComment, readyUrl } = await this.#_playerData.createPayment(amount);

        document.querySelector('#replenishData').style.visibility = 'visible';
        document.querySelector('#destinationAddress').textContent = destinationAddress;
        document.querySelector('#transactionComment').textContent = transactionComment;
        document.querySelector('#readyUrl').href = readyUrl;
    };
};