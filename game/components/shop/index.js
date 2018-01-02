import shops from '../../data/shops.json';
import { SERVER_LOAD_SHOP } from './redux/types';

export default class Shop {
    constructor(data) {
        this.loaded = new Promise((resolve, rejecte) => {
            Object.assign(this, data);

            this.loadShop(() => {
                resolve(this);
            });
        });
    }

    loadShop(callback) {

        callback()
    }
}


export function createShop(shopData) {
    return new Promise((resolve, rejecte) => {
        const newShop = new Shop(shopData);

        newShop.loaded.then(() => {
            resolve(newShop);
        })
    })
}

export function initialiseShops(dispatch) {
    return new Promise((resolve, rejecte) => {
        let loadedShops = 0;

        shops.map((shopData) => {
            createShop(shopData)
                .then((loadedShop) => {
                    loadedShops++;

                    dispatch({
                        type: SERVER_LOAD_SHOP,
                        payload: loadedShop
                    })

                    if (loadedShops === shops.length) {
                        resolve();
                    }
                })
        })
    })
}