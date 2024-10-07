import Requester from "./Requester.js";

export default class {
    id;
    balance;

    async init (telegramId) {
        this.id = telegramId;

        this.balance = await this.getBalance();
    };

    async createGame (amount) {
        const { gameId, calculatedResult } = await Requester(
            'game',
            'post',
            { 'content-type': 'application/json' },
            { telegramId: this.id, betSize: amount }
        );

        return [gameId, calculatedResult];
    };

    sendGameResult (gameId, result) {
        Requester(
            'game/result',
            'post',
            { 'content-type': 'application/json' },
            { gameId, factResult: result, telegramId: this.id }
        );
    };

    getTopGames (take, skip) {
        return Requester(
            `game/top-results?Take=${take}&Skip=${skip}`,
            'get',
            { accept: 'application/json' }
        );
    };

    getTonRate () {
        return Requester('payments/ton/rate', 'get', { accept: 'application/json' });
    };

    async getBalance () {
        return +(await Requester(
            'users',
            'post',
            { 'content-type': 'application/json' },
            { telegramId: this.id }
        )).balance.toFixed(2);
    };

    createPayment (amount) {
        return Requester(
            'payments/ton',
            'post',
            { 'content-type': 'application/json' },
            { telegramId: this.id, depositSize: amount }
        );
    };

    createWithdraw (amount) {
        return Requester(
            'withdraws',
            'post',
            { 'content-type': 'application/json' },
            { telegramId: this.id, amount, address: 'fsdffasf' }
        );
    };
};